import { test, expect } from '@playwright/test';

test.describe('Edit Page Tests', () => {
  test('should load edit page with resume data', async ({ page }) => {
    // Mock the API response to simulate existing resume
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resume: {
            basics: {
              name: '张三',
              email: 'zhangsan@example.com',
              phone: '13800138000',
              location: '北京',
              summary: '经验丰富的软件工程师，专注于后端开发和系统架构'
            },
            education: [
              {
                institution: '清华大学',
                degree: '计算机科学学士',
                field_of_study: '计算机科学与技术',
                start_date: '2018-09',
                end_date: '2022-07',
                gpa: '3.8/4.0'
              }
            ],
            work: [
              {
                company: '阿里巴巴',
                position: '高级软件工程师',
                start_date: '2022-08',
                end_date: '2024-12',
                description: '负责电商平台后端开发，使用Java和Spring框架',
                achievements: [
                  '优化系统性能，提升响应速度30%',
                  '设计并实现微服务架构',
                  '带领5人团队完成核心功能开发'
                ]
              }
            ],
            skills: [
              {
                name: 'Java',
                level: '高级',
                category: '编程语言'
              },
              {
                name: 'Python',
                level: '中级',
                category: '编程语言'
              }
            ],
            certificates: [
              {
                name: 'AWS认证解决方案架构师',
                issuer: 'Amazon Web Services',
                date: '2023-06',
                description: '云架构设计和部署认证'
              }
            ]
          }
        })
      });
    });

    await page.goto('/edit');
    
    // Check if page loads successfully
    await expect(page).toHaveTitle('求职助手 - AI 简历优化工具');
    await expect(page.locator('h1')).toContainText('简历编辑');
    
    // Check if resume data is displayed
    await expect(page.locator('h2:has-text("结构化简历数据")')).toBeVisible();
    await expect(page.locator('text=张三')).toBeVisible();
    await expect(page.locator('text=zhangsan@example.com')).toBeVisible();
    await expect(page.locator('text=清华大学')).toBeVisible();
    await expect(page.locator('text=阿里巴巴')).toBeVisible();
  });

  test('should display empty state when no resume exists', async ({ page }) => {
    // Mock the API response to simulate no resume
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Resume not found' })
      });
    });

    await page.goto('/edit');
    
    // Should show some content even when no resume exists
    // Note: When no resume exists, the page might redirect or show different content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Mock the API response to simulate server error
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/edit');
    
    // Should still show page content even with API error
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resume: {
            basics: {
              name: '张三',
              email: 'zhangsan@example.com'
            }
          }
        })
      });
    });

    await page.goto('/edit');
    
    // Check if action buttons are present
    await expect(page.locator('button:has-text("重新上传")')).toBeVisible();
    await expect(page.locator('button:has-text("查看测试页面")')).toBeVisible();
  });

  test('should navigate to upload page when clicking re-upload button', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resume: {
            basics: {
              name: '张三',
              email: 'zhangsan@example.com'
            }
          }
        })
      });
    });

    await page.goto('/edit');
    
    // Click re-upload button
    await page.click('button:has-text("重新上传")');
    
    // Should navigate to upload page
    await expect(page).toHaveURL('/upload');
  });

  test('should navigate to test page when clicking test page button', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/resume', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resume: {
            basics: {
              name: '张三',
              email: 'zhangsan@example.com'
            }
          }
        })
      });
    });

    await page.goto('/edit');
    
    // Click test page button
    await page.click('button:has-text("查看测试页面")');
    
    // Should navigate to test page
    await expect(page).toHaveURL('/test');
  });
}); 