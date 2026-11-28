import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../App'

describe('App Component (Integration Tests)', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('TC-09: renders application header, subtitle, and offline status indicator', async () => {
    const { container } = render(<App />)
    await screen.findByText('Complete DBMS Assignment')

    expect(screen.getByRole('heading', { level: 1, name: 'Offline Cable' })).toBeInTheDocument()
    expect(screen.getByText('Your tasks, available anywhere.')).toBeInTheDocument()

    const statusBadge = container.querySelector('.connection-status')
    expect(statusBadge).toBeInTheDocument()
    expect(statusBadge).toHaveTextContent('Offline')
    expect(statusBadge.querySelector('.status-dot')).toBeInTheDocument()
  })

  it('TC-10: renders all 3 initial tasks with accurate titles, descriptions, and badge classes', async () => {
    const { container } = render(<App />)
    await screen.findByText('Complete DBMS Assignment')

    expect(screen.getByRole('heading', { level: 2, name: 'My Tasks' })).toBeInTheDocument()

    const cards = container.querySelectorAll('.task-card')
    expect(cards).toHaveLength(3)

    // Task 1
    expect(within(cards[0]).getByText('Complete DBMS Assignment')).toBeInTheDocument()
    expect(within(cards[0]).getByText('Finish chapter 4 questions')).toBeInTheDocument()
    expect(cards[0].querySelector('.priority.high')).toHaveTextContent('High')
    expect(cards[0].querySelector('.sync-status.synced')).toHaveTextContent('synced')

    // Task 2
    expect(within(cards[1]).getByText('Prepare Mini Project')).toBeInTheDocument()
    expect(within(cards[1]).getByText('Work on Offline Cable dashboard')).toBeInTheDocument()
    expect(cards[1].querySelector('.priority.medium')).toHaveTextContent('Medium')
    expect(cards[1].querySelector('.sync-status.pending')).toHaveTextContent('pending')

    // Task 3
    expect(within(cards[2]).getByText('Submit SIH Documents')).toBeInTheDocument()
    expect(within(cards[2]).getByText('Review and submit final documents')).toBeInTheDocument()
    expect(cards[2].querySelector('.priority.high')).toHaveTextContent('High')
    expect(cards[2].querySelector('.sync-status.conflict')).toHaveTextContent('conflict')
  })

  it('TC-11: keeps TaskForm hidden by default and opens it when "+ Add Task" is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
  expect(screen.queryByRole('heading', { name: 'Add New Task' })).not.toBeInTheDocument()
})

    await user.click(screen.getByRole('button', { name: '+ Add Task' }))

    expect(screen.getByRole('heading', { name: 'Add New Task' })).toBeInTheDocument()
  })

  it('TC-12: closes TaskForm without adding a task when Cancel or close button is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await screen.findByText('Complete DBMS Assignment')

    // Open and close via Cancel
    await user.click(screen.getByRole('button', { name: '+ Add Task' }))
    await user.type(screen.getByPlaceholderText('Enter task title'), 'Unsaved Task')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('heading', { name: 'Add New Task' })).not.toBeInTheDocument()
    expect(container.querySelectorAll('.task-card')).toHaveLength(3)

    // Open and close via close
    await user.click(screen.getByRole('button', { name: '+ Add Task' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('heading', { name: 'Add New Task' })).not.toBeInTheDocument()
    expect(container.querySelectorAll('.task-card')).toHaveLength(3)
  })

  it('TC-13: adds a new task through TaskForm, closes modal, and appends it to the task list', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await screen.findByText('Complete DBMS Assignment')

    await user.click(screen.getByRole('button', { name: '+ Add Task' }))
    await user.type(screen.getByPlaceholderText('Enter task title'), 'Test Offline Sync')
    await user.type(
      screen.getByPlaceholderText('Enter task description'),
      'Verify queued tasks render as pending'
    )
    await user.selectOptions(screen.getByRole('combobox'), 'Low')
    await user.click(screen.getByRole('button', { name: /^Add Task$/ }))

    // Modal should close automatically
    expect(screen.queryByRole('heading', { name: 'Add New Task' })).not.toBeInTheDocument()

    // Task list should now have 4 cards
    const cards = container.querySelectorAll('.task-card')
    expect(cards).toHaveLength(4)

    const newCard = cards[3]
    expect(within(newCard).getByText('Test Offline Sync')).toBeInTheDocument()
    expect(within(newCard).getByText('Verify queued tasks render as pending')).toBeInTheDocument()
    expect(newCard.querySelector('.priority.low')).toHaveTextContent('Low')
    expect(newCard.querySelector('.sync-status.pending')).toHaveTextContent(/pending/i)
  })

  it('TC-14: supports adding multiple tasks sequentially while preserving existing tasks', async () => {
  const user = userEvent.setup()
  const { container } = render(<App />)

  await screen.findByText('Complete DBMS Assignment')

  const newTasks = [
    { title: 'QA Task 1', desc: 'First added task', priority: 'High' },
    { title: 'QA Task 2', desc: 'Second added task', priority: 'Medium' },
  ]

  for (const item of newTasks) {
    await user.click(screen.getByRole('button', { name: '+ Add Task' }))
    await user.type(screen.getByPlaceholderText('Enter task title'), item.title)
    await user.type(screen.getByPlaceholderText('Enter task description'), item.desc)
    await user.selectOptions(screen.getByRole('combobox'), item.priority)
    await user.click(screen.getByRole('button', { name: /^Add Task$/ }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Add New Task' })).not.toBeInTheDocument()
      expect(within(container).getByText(item.title)).toBeInTheDocument()
    })
  }

  await waitFor(() => {
    expect(container.querySelectorAll('.task-card')).toHaveLength(5)
  })

  const cards = container.querySelectorAll('.task-card')
  expect(within(cards[3]).getByText('QA Task 1')).toBeInTheDocument()
  expect(within(cards[4]).getByText('QA Task 2')).toBeInTheDocument()
})

  it('TC-15: keeps modal open and task count unchanged when submitting an empty title', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await screen.findByText('Complete DBMS Assignment')

    await user.click(screen.getByRole('button', { name: '+ Add Task' }))
    await user.click(screen.getByRole('button', { name: /^Add Task$/ }))

    expect(window.alert).toHaveBeenCalledWith('Please enter a task title.')
    expect(screen.getByRole('heading', { name: 'Add New Task' })).toBeInTheDocument()
    expect(container.querySelectorAll('.task-card')).toHaveLength(3)
  })

  it('TC-16: renders footer summary counters for Synced, Pending, and Conflict', async () => {
  const { container } = render(<App />)

  await screen.findByText('Complete DBMS Assignment')

  const footer = container.querySelector('footer.summary')
  expect(footer).toBeInTheDocument()

  const summaryBlocks = Array.from(footer.children).slice(0, 3)

  expect(summaryBlocks).toHaveLength(3)

  expect(summaryBlocks[0]).toHaveTextContent('1Synced')
  expect(summaryBlocks[1]).toHaveTextContent('1Pending')
  expect(summaryBlocks[2]).toHaveTextContent('1Conflict')
})
})
