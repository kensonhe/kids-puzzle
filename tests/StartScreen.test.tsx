import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { StartScreen } from '../src/components/StartScreen';

describe('StartScreen', () => {
  it('should render preset image options', () => {
    render(<StartScreen onStartGame={() => {}} />);
    expect(document.querySelectorAll('.image-card')).toHaveLength(4);
  });

  it('should render difficulty options', () => {
    render(<StartScreen onStartGame={() => {}} />);
    expect(document.querySelectorAll('.difficulty-btn')).toHaveLength(3);
  });

  it('should call onStartGame with selected image and difficulty', () => {
    let gameArgs: [string, number] = ['', 0];
    const onStartGame = (image: string, difficulty: number) => { gameArgs = [image, difficulty]; };
    render(<StartScreen onStartGame={onStartGame} />);
    fireEvent.click(document.querySelector('.image-card')!);
    fireEvent.click(document.querySelector('.difficulty-btn')!);
    fireEvent.click(document.querySelector('.start-btn')!);
    expect(gameArgs[0]).toBeTruthy();
    expect(gameArgs[1]).toBe(2);
  });

  it('should show upload button', () => {
    render(<StartScreen onStartGame={() => {}} />);
    expect(document.querySelector('.upload-btn')).not.toBeNull();
  });
});