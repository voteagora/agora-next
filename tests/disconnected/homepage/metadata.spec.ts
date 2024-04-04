import { test, expect } from "@playwright/test";

test('homepage metadata', async ({ page, baseURL }) => {
    await page.goto('/');

    // TODO: frh -> WIP this should be automatically get from multitenancy and check better what each tag is for
    const title = await page.title();
    await expect(title).toBe('Optimism Agora');

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    await expect(description).toBe('Home of token house governance and RPGF');

    // Testing Twitter meta tags
    const twitterCard = await page.locator('meta[name="twitter\\:card"]').first().getAttribute('content');
    await expect(twitterCard).toBe('summary_large_image');

    const twitterTitle = await page.locator('meta[name="twitter\\:title"]').first().getAttribute('content');
    await expect(twitterTitle).toBe('Optimism Agora');

    const twitterDescription = await page.locator('meta[name="twitter\\:description"]').first().getAttribute('content');
    await expect(twitterDescription).toBe('Home of token house governance and RPGF');

    const twitterImage = await page.locator('meta[name="twitter\\:image"]').first().getAttribute('content');
    await expect(twitterImage).toBe(`${baseURL}/api/images/og/proposals?title=Optimism%20Agora&description=Home%20of%20token%20house%20governance%20and%20RPGF`);

    const twitterImageWidth = await page.locator('meta[name="twitter\\:image\\:width"]').first().getAttribute('content');
    await expect(twitterImageWidth).toBe('1200');

    const twitterImageHeight = await page.locator('meta[name="twitter\\:image\\:height"]').first().getAttribute('content');
    await expect(twitterImageHeight).toBe('630');

    // Testing OG meta tags
    const ogTitle = await page.locator('meta[property="og\\:title"]').getAttribute('content');
    await expect(ogTitle).toBe('Optimism Agora');

    const ogDescription = await page.locator('meta[property="og\\:description"]').getAttribute('content');
    await expect(ogDescription).toBe('Home of token house governance and RPGF');

    const ogImage = await page.locator('meta[property="og\\:image"]').getAttribute('content');
    await expect(ogImage).toBe(`${baseURL}/api/images/og/proposals?title=Optimism%20Agora&description=Home%20of%20token%20house%20governance%20and%20RPGF`);

    const ogImageWidth = await page.locator('meta[property="og\\:image\\:width"]').getAttribute('content');
    await expect(ogImageWidth).toBe('1200');

    const ogImageHeight = await page.locator('meta[property="og\\:image\\:height"]').getAttribute('content');
    await expect(ogImageHeight).toBe('630');

});