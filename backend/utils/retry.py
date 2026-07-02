"""
Exponential backoff retry decorator for async functions.

Handles transient Google Gemini API errors (rate limits, 5xx responses,
temporary service unavailability) without requiring changes to callers.

Usage:
    from backend.utils.retry import async_retry

    @async_retry(max_attempts=3, base_delay=2.0)
    async def call_llm() -> str:
        ...
"""
import asyncio
import functools
import logging
from typing import Any, Callable, TypeVar

logger = logging.getLogger(__name__)

T = TypeVar("T")


def async_retry(
    max_attempts: int = 3,
    base_delay: float = 2.0,
    max_delay: float = 30.0,
    retryable_exceptions: tuple[type[Exception], ...] = (Exception,),
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """
    Async exponential backoff retry decorator.

    Delay schedule: base_delay * 2^(attempt-1), capped at max_delay.
    Example with base_delay=2.0: 2s → 4s → 8s → ...

    Args:
        max_attempts: Total number of attempts (1 = no retry).
        base_delay: Seconds before first retry. Doubles each attempt.
        max_delay: Maximum delay cap in seconds.
        retryable_exceptions: Exception types that trigger a retry.
            Defaults to all exceptions. Narrow for production specificity.

    Returns:
        Decorated async function with retry behaviour.

    Raises:
        The last exception raised after all attempts are exhausted.
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            last_exc: Exception | None = None

            for attempt in range(1, max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except retryable_exceptions as exc:
                    last_exc = exc

                    if attempt == max_attempts:
                        logger.error(
                            "Function '%s' failed after %d/%d attempts. Final error: %s",
                            func.__name__,
                            attempt,
                            max_attempts,
                            exc,
                        )
                        break

                    delay = min(base_delay * (2.0 ** (attempt - 1)), max_delay)
                    logger.warning(
                        "Function '%s' attempt %d/%d failed: %s. Retrying in %.1fs...",
                        func.__name__,
                        attempt,
                        max_attempts,
                        exc,
                        delay,
                    )
                    await asyncio.sleep(delay)

            raise last_exc  # type: ignore[misc]

        return wrapper
    return decorator
