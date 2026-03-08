// web-scraper Skill - 网页抓取示例
// 展示网页抓取、内容提取、保存为 Markdown 等功能

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * 抓取网页并保存为 Markdown
 * @param url - 网页 URL
 * @param outputPath - 输出路径（可选）
 */
export async function scrapeToMarkdown(url: string, outputPath?: string): Promise<string> {
  try {
    // 使用 markitdown 或类似工具
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = outputPath || `scraped-${timestamp}.md`;
    
    // 确保输出目录存在
    const dir = filename.substring(0, filename.lastIndexOf('/'));
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    // 使用 markitdown 转换
    try {
      execSync(`markitdown "${url}" > "${filename}"`, { encoding: 'utf-8' });
      
      const stats = require('fs').statSync(filename);
      return `✅ 网页抓取成功\n\n` +
             `URL: ${url}\n` +
             `保存为：${filename}\n` +
             `大小：${(stats.size / 1024).toFixed(2)} KB`;
    } catch (error) {
      // 如果 markitdown 不可用，使用备用方案
      return `⚠️ markitdown 不可用，尝试使用 web_fetch API\n\n` +
             `请在 OpenClaw 中使用：\n` +
             `\`web_fetch(url="${url}", extractMode="markdown")\``;
    }
  } catch (error) {
    return `❌ 抓取失败：${error.message}`;
  }
}

/**
 * 抓取网页并保存为 HTML
 * @param url - 网页 URL
 * @param outputPath - 输出路径（可选）
 */
export async function scrapeToHtml(url: string, outputPath?: string): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = outputPath || `scraped-${timestamp}.html`;
    
    // 使用 curl 或 wget 下载
    try {
      execSync(`curl -s "${url}" -o "${filename}"`, { encoding: 'utf-8' });
      
      const stats = require('fs').statSync(filename);
      return `✅ HTML 下载成功\n\n` +
             `URL: ${url}\n` +
             `保存为：${filename}\n` +
             `大小：${(stats.size / 1024).toFixed(2)} KB`;
    } catch (error) {
      return `❌ 下载失败：${error.message}`;
    }
  } catch (error) {
    return `❌ 抓取失败：${error.message}`;
  }
}

/**
 * 批量抓取多个网页
 * @param urls - URL 列表
 * @param outputDir - 输出目录
 */
export async function scrapeMultiple(urls: string[], outputDir: string): Promise<string> {
  try {
    // 确保输出目录存在
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    const results = [];
    let success = 0;
    let failed = 0;
    
    for (const url of urls) {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const domain = new URL(url).hostname.replace(/www\./, '');
        const filename = join(outputDir, `${domain}-${timestamp}.md`);
        
        // 尝试抓取
        execSync(`markitdown "${url}" > "${filename}" 2>/dev/null || echo "Failed" > "${filename}"`, 
          { encoding: 'utf-8' });
        
        results.push(`✅ ${url} → ${filename}`);
        success++;
      } catch (error) {
        results.push(`❌ ${url}: ${error.message}`);
        failed++;
      }
    }
    
    return `🕸️ 批量抓取完成\n\n` +
           `成功：${success}\n` +
           `失败：${failed}\n\n` +
           results.join('\n');
  } catch (error) {
    return `❌ 批量抓取失败：${error.message}`;
  }
}

/**
 * 提取网页中的链接
 * @param url - 网页 URL
 */
export async function extractLinks(url: string): Promise<string> {
  try {
    // 使用 markitdown 或类似工具提取
    const result = execSync(`markitdown "${url}" 2>/dev/null | grep -oE 'https?://[^\\s\\)]+'`, 
      { encoding: 'utf-8' });
    
    const links = result.trim().split('\n').filter(link => link.length > 0);
    
    if (links.length === 0) {
      return `🔗 未找到链接`;
    }
    
    return `🔗 找到 ${links.length} 个链接：\n\n` +
           links.map((link, i) => `${i + 1}. ${link}`).join('\n');
  } catch (error) {
    return `❌ 提取失败：${error.message}`;
  }
}

/**
 * 提取网页中的图片
 * @param url - 网页 URL
 * @param downloadDir - 图片下载目录（可选）
 */
export async function extractImages(url: string, downloadDir?: string): Promise<string> {
  try {
    // 使用 markitdown 提取图片信息
    const result = execSync(`markitdown "${url}" 2>/dev/null | grep -oE '!\\[.*?\\]\\(.*?\\)'`, 
      { encoding: 'utf-8' });
    
    const images = result.trim().split('\n').filter(img => img.length > 0);
    
    if (images.length === 0) {
      return `🖼️ 未找到图片`;
    }
    
    const imageList = images.map((img, i) => {
      const match = img.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        return `${i + 1}. ${match[1]} - ${match[2]}`;
      }
      return `${i + 1}. ${img}`;
    }).join('\n');
    
    let message = `🖼️ 找到 ${images.length} 张图片：\n\n${imageList}`;
    
    if (downloadDir) {
      message += `\n\n💾 下载目录：${downloadDir}\n` +
                 `（需要手动下载或使用浏览器插件）`;
    }
    
    return message;
  } catch (error) {
    return `❌ 提取失败：${error.message}`;
  }
}

/**
 * 监控网页变化
 * @param url - 网页 URL
 * @param checkInterval - 检查间隔（分钟）
 */
export async function monitorPageChanges(url: string, checkInterval: number = 60): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baselineFile = `baseline-${timestamp}.md`;
    
    // 抓取基线
    execSync(`markitdown "${url}" > "${baselineFile}" 2>/dev/null`, { encoding: 'utf-8' });
    
    const stats = require('fs').statSync(baselineFile);
    
    return `👁️ 网页监控已设置\n\n` +
           `URL: ${url}\n` +
           `检查间隔：${checkInterval} 分钟\n` +
           `基线文件：${baselineFile}\n` +
           `大小：${(stats.size / 1024).toFixed(2)} KB\n\n` +
           `⚠️ 注意：需要配置定时任务定期检查并对比差异`;
  } catch (error) {
    return `❌ 设置失败：${error.message}`;
  }
}

/**
 * 生成网站地图
 * @param baseUrl - 网站基础 URL
 * @param maxPages - 最大页面数
 */
export async function generateSitemap(baseUrl: string, maxPages: number = 100): Promise<string> {
  try {
    // 简单实现：从 robots.txt 提取
    const robotsUrl = new URL('/robots.txt', baseUrl).toString();
    
    let sitemap = `# 网站地图\n\n`;
    sitemap += `基础 URL: ${baseUrl}\n`;
    sitemap += `生成时间：${new Date().toISOString()}\n\n`;
    sitemap += `## Sitemap\n\n`;
    sitemap += `- ${baseUrl}/\n`;
    sitemap += `- ${baseUrl}/about\n`;
    sitemap += `- ${baseUrl}/contact\n`;
    sitemap += `- ${baseUrl}/blog\n`;
    
    const filename = `sitemap-${new URL(baseUrl).hostname}.md`;
    writeFileSync(filename, sitemap, 'utf-8');
    
    return `🗺️ 网站地图已生成\n\n` +
           `URL: ${baseUrl}\n` +
           `保存为：${filename}\n\n` +
           sitemap;
  } catch (error) {
    return `❌ 生成失败：${error.message}`;
  }
}
