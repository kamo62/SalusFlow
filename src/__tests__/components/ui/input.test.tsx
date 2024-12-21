import React from 'react'
import { render, screen } from '@/__tests__/utils/test-utils'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />)
    expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled()
  })

  it('handles value changes', async () => {
    const handleChange = jest.fn()
    const { user } = render(<Input onChange={handleChange} placeholder="Type here" />)
    
    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'Hello')
    
    expect(handleChange).toHaveBeenCalledTimes(5) // Once for each character
    expect(input).toHaveValue('Hello')
  })

  it('applies error styles when error prop is true', () => {
    render(<Input error placeholder="Error input" />)
    const input = screen.getByPlaceholderText('Error input')
    expect(input.className).toContain('border-destructive')
    expect(input.className).toContain('focus-visible:ring-destructive')
  })

  it('renders with custom className', () => {
    render(<Input className="custom-class" placeholder="Custom input" />)
    const input = screen.getByPlaceholderText('Custom input')
    expect(input.className).toContain('custom-class')
  })

  it('handles different input types', () => {
    render(<Input type="password" placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('handles required attribute', () => {
    render(<Input required placeholder="Required input" />)
    const input = screen.getByPlaceholderText('Required input')
    expect(input).toBeRequired()
  })

  it('handles readonly attribute', () => {
    render(<Input readOnly value="Read only" placeholder="Read only input" />)
    const input = screen.getByPlaceholderText('Read only input')
    expect(input).toHaveAttribute('readonly')
  })
}) 