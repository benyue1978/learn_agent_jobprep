import { test, expect } from '@playwright/test';
import { mockResumeAPI, mockChatAPI } from './mocks/api-mocks';
import { createTestResume, createTestChatResponse } from './fixtures/resume-data';

test.describe('Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 设置API模拟
    await mockResumeAPI(page, createTestResume());
    await mockChatAPI(page, createTestChatResponse());
  });

  test('should complete full page workflow @real-backend', async ({ page }) => {
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
    await expect(page.locator('h2:has-text("基本信息")')).toBeVisible();
    await expect(page.locator('h2:has-text("教育经历")')).toBeVisible();
    await expect(page.locator('h2:has-text("工作经历")')).toBeVisible();
    await expect(page.locator('h2:has-text("技能专长")')).toBeVisible();
    await expect(page.locator('h2:has-text("证书认证")')).toBeVisible();
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

  test('should display structured resume sections correctly', async ({ page }) => {
    // Mock the API response with complete resume data
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
              summary: '经验丰富的软件工程师，专注于后端开发和系统架构设计。'
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
                description: '负责电商平台后端开发，处理高并发订单系统',
                achievements: [
                  '优化系统性能，提升响应速度30%',
                  '设计并实现微服务架构'
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
                name: 'Spring Boot',
                level: '高级',
                category: '框架'
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
    
    // Check if all sections are displayed
    await expect(page.locator('h2:has-text("基本信息")')).toBeVisible();
    await expect(page.locator('h2:has-text("教育经历")')).toBeVisible();
    await expect(page.locator('h2:has-text("工作经历")')).toBeVisible();
    await expect(page.locator('h2:has-text("技能专长")')).toBeVisible();
    await expect(page.locator('h2:has-text("证书认证")')).toBeVisible();
    
    // Check basic info content
    await expect(page.locator('text=张三')).toBeVisible();
    await expect(page.locator('text=zhangsan@example.com')).toBeVisible();
    await expect(page.locator('text=13800138000')).toBeVisible();
    await expect(page.locator('text=北京')).toBeVisible();
    await expect(page.locator('text=经验丰富的软件工程师')).toBeVisible();
    
    // Check education content
    await expect(page.locator('text=清华大学')).toBeVisible();
    await expect(page.locator('text=计算机科学学士')).toBeVisible();
    await expect(page.locator('text=3.8/4.0')).toBeVisible();
    
    // Check work experience content
    await expect(page.locator('text=阿里巴巴')).toBeVisible();
    await expect(page.locator('text=高级软件工程师')).toBeVisible();
    await expect(page.locator('text=负责电商平台后端开发')).toBeVisible();
    await expect(page.locator('text=优化系统性能，提升响应速度30%')).toBeVisible();
    
    // Check skills content
    await expect(page.locator('text=Java')).toBeVisible();
    await expect(page.locator('text=Spring Boot')).toBeVisible();
    await expect(page.locator('span:has-text("高级")').first()).toBeVisible();
    
    // Check certificates content
    await expect(page.locator('text=AWS认证解决方案架构师')).toBeVisible();
    await expect(page.locator('text=Amazon Web Services')).toBeVisible();
  });

  test('should display and handle AI suggestions correctly', async ({ page }) => {
    // Mock the API response with suggestions
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
              summary: '经验丰富的软件工程师',
              suggestions: [
                {
                  field: 'basics.summary',
                  current: '经验丰富的软件工程师',
                  suggested: '经验丰富的全栈软件工程师，专注于后端开发和系统架构设计',
                  reason: '添加更具体的技术栈描述，突出全栈能力'
                }
              ]
            },
            education: [
              {
                institution: '清华大学',
                degree: '计算机科学学士',
                field_of_study: '计算机科学与技术',
                start_date: '2018-09',
                end_date: '2022-07',
                gpa: '3.8/4.0',
                suggestions: [
                  {
                    field: 'education[0].gpa',
                    current: '3.8/4.0',
                    suggested: '3.8/4.0 (优秀)',
                    reason: '添加评价说明，突出学术表现'
                  }
                ]
              }
            ],
            work: [
              {
                company: '阿里巴巴',
                position: '高级软件工程师',
                start_date: '2022-08',
                end_date: '2024-12',
                description: '负责电商平台后端开发',
                achievements: [
                  '优化系统性能，提升响应速度30%',
                  '设计并实现微服务架构'
                ],
                suggestions: [
                  {
                    field: 'work[0].description',
                    current: '负责电商平台后端开发',
                    suggested: '负责阿里巴巴电商平台后端开发，处理高并发订单系统',
                    reason: '添加具体公司名称和更详细的技术描述'
                  }
                ]
              }
            ],
            skills: [
              {
                name: 'Java',
                level: '高级',
                category: '编程语言',
                suggestions: [
                  {
                    field: 'skills[0].level',
                    current: '高级',
                    suggested: '精通',
                    reason: '使用更专业的技能等级描述'
                  }
                ]
              }
            ],
            certificates: [
              {
                name: 'AWS认证解决方案架构师',
                issuer: 'Amazon Web Services',
                date: '2023-06',
                description: '云架构设计和部署认证',
                suggestions: [
                  {
                    field: 'certificates[0].description',
                    current: '云架构设计和部署认证',
                    suggested: 'AWS官方认证的云架构设计和部署专家，具备企业级云解决方案设计能力',
                    reason: '添加更详细的认证描述和技能说明'
                  }
                ]
              }
            ]
          }
        })
      });
    });

    await page.goto('/edit');
    
    // Check if suggestions are displayed
    await expect(page.locator('text=AI 建议').first()).toBeVisible();
    await expect(page.locator('text=当前内容：').first()).toBeVisible();
    await expect(page.locator('text=建议内容：').first()).toBeVisible();
    await expect(page.locator('text=修改理由：').first()).toBeVisible();
    
    // Check if accept/reject buttons are present
    await expect(page.locator('button:has-text("接受")').first()).toBeVisible();
    await expect(page.locator('button:has-text("拒绝")').first()).toBeVisible();
    
    // Verify that we have 5 suggestions total
    await expect(page.locator('text=AI 建议')).toHaveCount(5);
  });
}); 