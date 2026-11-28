import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TaskForm from '../components/TaskForm'

describe('TaskForm Component (Unit Tests)', () => {
  let onAddMock
  let onCancelMock
  let alertMock

  beforeEach(() => {
    onAddMock = vi.fn()
    onCancelMock = vi.fn()
    alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('TC-01: renders modal heading, form fields, default priority, and action buttons', () => {
    render(<TaskForm onAdd={onAddMock} onCancel={onCancelMock} />)

    expect(screen.getByRole('heading', { name: 'Add New Task' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter task title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter task description')).toBeInTheDocument()

    const prioritySelect = screen.getByRole('combobox')
    expect(prioritySelect).toHaveValue('Medium')
    expect(screen.getByRole('option', { name: 'Low' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'High' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('TC-02: submits valid task with trimmed fields and metadata', async () => {
    const user = userEvent.setup()
    render(<TaskForm onAdd={onAddMock} onCancel={onCancelMock} />)

    const titleInput = screen.getByPlaceholderText('Enter task title')
    const descInput = screen.getByPlaceholderText('Enter task description')
    const prioritySelect = screen.getByRole('combobox')

    await user.type(titleInput, '  Write Unit Tests  ')
    await user.type(descInput, '  Cover all edge cases  ')
    await user.selectOptions(prioritySelect, 'High')
    await user.click(screen.getByRole('button', { name: 'Add Task' }))

    expect(alertMock).not.toHaveBeenCalled()
    expect(onAddMock).toHaveBeenCalledTimes(1)

    const submittedTask = onAddMock.mock.calls[0][0]
    expect(submittedTask).toMatchObject({
      title: 'Write Unit Tests',
      description: 'Cover all edge cases',
      priority: 'High',
      completed: false,
      syncStatus: 'pending',
    })
    expect(typeof submittedTask.id).toBe('string')
    expect(submittedTask.id.length).toBeGreaterThan(0)
    expect(typeof submittedTask.createdAt).toBe('number')
    expect(typeof submittedTask.updatedAt).toBe('number')

    // Standalone form retains its values after calling onAdd
expect(titleInput).toHaveValue('  Write Unit Tests  ')
expect(descInput).toHaveValue('  Cover all edge cases  ')
expect(prioritySelect).toHaveValue('High')
  })

  it('TC-03: shows alert and blocks submission when title is empty', async () => {
    const user = userEvent.setup()
    render(<TaskForm onAdd={onAddMock} onCancel={onCancelMock} />)

    await user.click(screen.getByRole('button', { name: 'Add Task' }))

    expect(alertMock).toHaveBeenCalledTimes(1)
    expect(alertMock).toHaveBeenCalledWith('Please enter a task title.')
    expect(onAddMock).not.toHaveBeenCalled()
  })

  it('TC-04: shows alert and blocks submission when title contains only whitespace', async () => {
    const user = userEvent.setup()
    render(<TaskForm onAdd={onAddMock} onCancel={onCancelMock} />)

    await user.type(screen.getByPlaceholderText('Enter task title'), '     ')
    await user.type(screen.getByPlaceholderText('Enter task description'), 'Some description')
    await user.click(screen.getByRole('button', { name: 'Add Task' }))

    expect(alertMock).toHaveBeenCalledWith('Please enter a task title.')
    expect(onAddMock).not.toHaveBeenCalled()
  })

  it('TC-05: allows submitting a task with an empty description', async () => {
    const user = userEvent.setup()
    render(<TaskForm onAdd={onAddMock} onCancel={onCancelMock} />)

    await user.type(screen.getByPlaceholderText('Enter task title'), 'Quick Reminder')
    await user.selectOptions(screen.getByRole('combobox'), 'Low')
    await user.click(screen.getByRole('button', { name: 'Add Task' }))

    expect(onAddMock).toHaveBeenCalledTimes(1)
    expect(onAddMock.mock.calls[0][0]).toMatchObject({
      title: 'Quick Reminder',
      description: '',
      priority: 'Low',
      syncStatus: 'pending',
    })
  })

  it('TC-06: calls onCancel and does not submit when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskForm onAdd={onAddMock} onCancel={onCancelMock} />)

    await user.type(screen.getByPlaceholderText('Enter task title'), 'Draft Task')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancelMock).toHaveBeenCalledTimes(1)
    expect(onAddMock).not.toHaveBeenCalled()
  })

  it('TC-07: calls onCancel and does not submit when close (×) button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskForm onAdd={onAddMock} onCancel={onCancelMock} />)

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(onCancelMock).toHaveBeenCalledTimes(1)
    expect(onAddMock).not.toHaveBeenCalled()
  })

  it('TC-08: generates unique IDs for consecutive task submissions', async () => {
    const user = userEvent.setup()
    render(<TaskForm onAdd={onAddMock} onCancel={onCancelMock} />)

    const titleInput = screen.getByPlaceholderText('Enter task title')
    const submitBtn = screen.getByRole('button', { name: 'Add Task' })

    await user.type(titleInput, 'Task One')
    await user.click(submitBtn)

    await user.type(titleInput, 'Task Two')
    await user.click(submitBtn)

    expect(onAddMock).toHaveBeenCalledTimes(2)
    const firstId = onAddMock.mock.calls[0][0].id
    const secondId = onAddMock.mock.calls[1][0].id
    expect(firstId).not.toBe(secondId)
  })
})
