#!/usr/bin/env node
/**
 * Download all Stitch screen assets (HTML + Screenshots)
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENS = [
  {
    title: "Analytics",
    id: "b062f9d81e884459a7e68c8ed3fba36e",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NWVjMWQyM2Y4MDcwNzc5YmZmYjc2MWQ3ZDQ4EgsSBxCevNLunxsYAZIBIwoKcHJvamVjdF9pZBIVQhM0MzI2Njk5NjEyMTMwNTIxNDM1&filename=&opi=89354086",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AP1WRLsxxxyiwxIl2kIT9-ZsbtAipp-JCj19hsG9Fc9ivIFQGqhczZYHUog-uHez3nUPABgG1hbRqUX37aQVeiGqfAS3paH6o6dkBuurOqT1Vc0m1v7fzkIm5SNmEq0-HpE8CVa_VozDWp-TpkkrgjZqf_gVdmuHP-NicAFVN-NV6QGOKAAx6vTH4urhs-jsXmQeeCUynKDTx5-E3Az9ZL5B51M9S4FYfp13tZp-mnwVyedeZqVxtxayXBMdOtc"
  },
  {
    title: "Pipeline Execution",
    id: "aaf360c3d282464e95818c31c3ce4342",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NWVjMWM4ZTY5YzUwNTAzYzI5OTE3MTVkNWFjEgsSBxCevNLunxsYAZIBIwoKcHJvamVjdF9pZBIVQhM0MzI2Njk5NjEyMTMwNTIxNDM1&filename=&opi=89354086",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AP1WRLuZmqQGsbgk_wtpDaCBEnKvTRts18PRQt741mZeHppldCiDGIcnXw54koZ_eC0dyUKmXT64ARORuAUOb_jyz6NxUrrfu6P9HYdYE1GZ33dHwzcwTd2FcgaqL4LGTc-QtF4KQ8_iwDJOqVuBJvUA34-e8v7wLXRprSS56lGCCeCRcZc1R-6NzZhfnNHt0buy5rWa_OKKHW1aXiquscWux4DKFmp_Mwtfwot9_wvIky2iTj4f7eByiagNan4"
  },
  {
    title: "Settings",
    id: "5381d771bcab4b2381b7acf51a5e4e0f",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NWVjMjFmMWMyYWQwMzM4NWE4MGE3MGEyYTc3EgsSBxCevNLunxsYAZIBIwoKcHJvamVjdF9pZBIVQhM0MzI2Njk5NjEyMTMwNTIxNDM1&filename=&opi=89354086",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AP1WRLsK9Q7UQsjAjsHu4FL6fmSulmEJ9yV5B0EoWACdIEMik7MboPMQPRS94KHKqtXLfE9qPYfM6MLPAyRYOk8Da_W5oFBjkNUkoVrIsWeQ6YxiKTKGTk8AqVf6hoW0YH09V69Oq50SOoNTOe7RuRMJ5HZBIakqu5g0sLCpGaqvY8CmxH0Mzm05db9CHdMlO3XpZNOwe2L6EgzNIs8rLPSOgnP1fYpndiITvE4pMsT_WL5p4LSqqVpajEn-eP4"
  },
  {
    title: "AI Agents",
    id: "de38175374ce4de689d1c90803007d26",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NWVjMWM0OGFiMTUwMmE5OTY1NmI5MzFkZjI3EgsSBxCevNLunxsYAZIBIwoKcHJvamVjdF9pZBIVQhM0MzI2Njk5NjEyMTMwNTIxNDM1&filename=&opi=89354086",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AP1WRLtsKeNygA-S76FsSF53GKnWJC6avbvWrFpZOC4-3szjWAryIRkdszQhIrM615iMp28RBIeKqXXeUisshtW1tgEnsZ75ulxk8xBSVtuIs6JgXA_eMfInhOJHPFySoWHYgULKi7UBDhv-ESlFdxYWFFWajKggQhQycWFLkVOm8Uh-ssUW4LjsZ_o-8kqQsY-7aY9_EjoPsO2DVFx3zzk19bWIjBJcEK4lBjml50yuMjqifxwUEADMazBp8qg"
  },
  {
    title: "Mission Control",
    id: "2e93675368d94652bf84ac76e9893d1a",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NWVjMWIwYWQ5MmIwODI5YjQ1YWM0MmUxZTVkEgsSBxCevNLunxsYAZIBIwoKcHJvamVjdF9pZBIVQhM0MzI2Njk5NjEyMTMwNTIxNDM1&filename=&opi=89354086",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AP1WRLtyiTQary6QOZNPyYam7lGY9x5cr02p9x01q48HILVfQb1ewD_gtV6zwKqPhV5O4Z_zL9pSz9aPpAt32flaxa88AzTR3flZ7J8qUbbGZ-0TRxt-75XauIjSboAIBGqrniEKqa4A8KWYdKoD3ERRtH5Q_YwzFLe0IcHNCJ47NNfh42jZ6nbcPzrbZGCYKJo1qdgfhhNJorkAXCAFf3P1TW8KvixgmTF_xQn5PcSR_z7INKEMTAjSbB8b9BQ"
  },
  {
    title: "Architecture",
    id: "4a1596cc781744c2a8e75a5f9de49467",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NWVjMWNmZDY5NTEwNDMxMWQzOGNmMjVlZTgwEgsSBxCevNLunxsYAZIBIwoKcHJvamVjdF9pZBIVQhM0MzI2Njk5NjEyMTMwNTIxNDM1&filename=&opi=89354086",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AP1WRLsl7uVk90DaFKDFxjCPNDiapHuj_DM8oarEXfC0hQSQP_wjY9rTLrf-VEuCzhCcv-m5rm6dY6HzMV_9f6buvSmYrk9s8qTPJGTpYCdFhigx9lZ4mGcR91C_eaGijsNbEn0z57a67vDMJzHGa6AFeexH4JsEZ0ELkftRx_ssCy_-iiyz9w2LOqfwtH7y9ZVOAri-gvgOkz0ZUE1FoyaynM-OuLXGsfOv4yeRjGrC1D-u0yr_YE7aaBxqFWo"
  },
  {
    title: "Decision Report",
    id: "d4af39c217814c728b2fd33fb11c1fc6",
    htmlUrl: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1NWVjMWM2OTNmMDEwOTI1ZDE2ZDRiMDIxZDZlEgsSBxCevNLunxsYAZIBIwoKcHJvamVjdF9pZBIVQhM0MzI2Njk5NjEyMTMwNTIxNDM1&filename=&opi=89354086",
    screenshotUrl: "https://lh3.googleusercontent.com/aida/AP1WRLuHJ7m4yJtpDZej9bejRVaeg3uyJsTXKGXCdd_JrxRYElxnpEPWh0EpwUexlYbk1KsAfno7HTmvyel8I-PB3dGFwR6N-ww5Z8LlCRsJY8MxXm-dsl840XXqmPNK-OT2dXe_w8wIBzsCrTv7o0IuX9oF9wuJMnvziCyBcHketCsSUZGAQuZMYN-plqVUO2GRhd4ovFmyvk63S_WruErEPJDqu18HMxuumh9j5TfvMUf4MexPlj5Yg1pP1vk"
  }
];

async function downloadFile(url, filepath) {
  console.log(`  📥 Downloading: ${path.basename(filepath)}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  await writeFile(filepath, Buffer.from(buffer));
  console.log(`  ✅ Saved: ${path.basename(filepath)}`);
}

async function main() {
  console.log('🎨 Downloading Stitch screens...\n');

  const designsDir = path.join(__dirname, '..', 'stitch-designs');
  const imagesDir = path.join(designsDir, 'screenshots');
  const htmlDir = path.join(designsDir, 'html');

  // Create directories
  if (!existsSync(designsDir)) await mkdir(designsDir, { recursive: true });
  if (!existsSync(imagesDir)) await mkdir(imagesDir, { recursive: true });
  if (!existsSync(htmlDir)) await mkdir(htmlDir, { recursive: true });

  for (const screen of SCREENS) {
    console.log(`\n📄 ${screen.title} (${screen.id})`);
    
    try {
      // Download HTML
      const htmlPath = path.join(htmlDir, `${screen.id}.html`);
      await downloadFile(screen.htmlUrl, htmlPath);

      // Download Screenshot
      const imagePath = path.join(imagesDir, `${screen.id}.png`);
      await downloadFile(screen.screenshotUrl, imagePath);

      // Save metadata
      const metaPath = path.join(designsDir, `${screen.id}.json`);
      await writeFile(metaPath, JSON.stringify({
        title: screen.title,
        id: screen.id,
        htmlFile: `html/${screen.id}.html`,
        screenshotFile: `screenshots/${screen.id}.png`,
        downloadedAt: new Date().toISOString()
      }, null, 2));

    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n✨ All screens downloaded!');
  console.log(`📁 Location: ${designsDir}\n`);
  console.log('Next: Analyze HTML structure and extract design tokens');
}

main().catch(console.error);
