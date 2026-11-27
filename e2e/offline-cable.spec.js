import { test, expect } from '@playwright/test'

test.describe('Offline Cable - End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('E2E-01: loads dashboard with header, offline badge, 3 initial tasks, and summary footer', async ({ page }) => {
    await expect(page).toHaveTitle(/offline-cable/i)
    await expect(page.getByRole('heading', { name: 'Offline Cable' })).toBeVisible()
    await expect(page.getByText('Your tasks, available anywhere.')).toBeVisible()
    await expect(page.locator('.connection-status')).toContainText('Offline')

    const cards = page.locator('.task-card')
    await expect(cards).toHaveCount(3)
    await expect(cards.nth(0)).toContainText('Complete DBMS Assignment')
    await expect(cards.nth(1)).toContainText('Prepare Mini Project')
    await expect(cards.nth(2)).toContainText('Submit SIH Documents')

    await expect(page.locator('footer.summary')).toBeVisible()
  })

  test('E2E-02: creates a new task via modal form and displays it in the task list', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Task' }).click()
    await expect(page.getByRole('heading', { name: 'Add New Task' })).toBeVisible()

    await page.getByPlaceholder('Enter task title').fill('Deploy Offline Cable')
    await page.getByPlaceholder('Enter task description').fill('Prepare final demo build')
    await page.locator('select').selectOption('High')
    await page.getByRole('button', { name: /^Add Task$/ }).click()

    await expect(page.getByRole('heading', { name: 'Add New Task' })).toBeHidden()

    const cards = page.locator('.task-card')
    await expect(cards).toHaveCount(4)
    await expect(cards.nth(3)).toContainText('Deploy Offline Cable')
    await expect(cards.nth(3)).toContainText('Prepare final demo build')
    await expect(cards.nth(3).locator('.priority.high')).toHaveText('High')
    await expect(cards.nth(3).locator('.sync-status.pending')).toContainText(/pending/i)
  })

  test('E2E-03: triggers alert dialog when submitting empty title and keeps modal open', async ({ page }) => {
    let dialogMessage = ''
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message()
      await dialog.accept()
    })

    await page.getByRole('button', { name: '+ Add Task' }).click()
    await page.getByRole('button', { name: /^Add Task$/ }).click()

    expect(dialogMessage).toBe('Please enter a task title.')
    await expect(page.getByRole('heading', { name: 'Add New Task' })).toBeVisible()
    await expect(page.locator('.task-card')).toHaveCount(3)
  })

  test('E2E-04: cancels modal via Cancel button and close (×) button without changing tasks', async ({ page }) => {
    await page.getByRole('button', { name: '+ Add Task' }).click()
    await page.getByPlaceholder('Enter task title').fill('Temporary Task')
    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect(page.getByRole('heading', { name: 'Add New Task' })).toBeHidden()
    await expect(page.locator('.task-card')).toHaveCount(3)

    await page.getByRole('button', { name: '+ Add Task' }).click()
    await page.getByRole('button', { name: '×' }).click()

    await expect(page.getByRole('heading', { name: 'Add New Task' })).toBeHidden()
    await expect(page.locator('.task-card')).toHaveCount(3)
  })

  test('E2E-05: continues allowing task creation when browser network is offline', async ({ page, context }) => {
    // Simulate offline network after initial app load
    await context.setOffline(true)

    await page.getByRole('button', { name: '+ Add Task' }).click()
    await page.getByPlaceholder('Enter task title').fill('Offline Created Task')
    await page.getByPlaceholder('Enter task description').fill('Created while network is disconnected')
    await page.locator('select').selectOption('Low')
    await page.getByRole('button', { name: /^Add Task$/ }).click()

    await expect(page.locator('.task-card')).toHaveCount(4)
    await expect(page.locator('.task-card').nth(3)).toContainText('Offline Created Task')

    await context.setOffline(false)
  })

  test('E2E-06: renders without horizontal overflow on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalOverflow).toBe(false)
    await expect(page.getByRole('button', { name: '+ Add Task' })).toBeVisible()
  })
})
