import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CompleteScreen } from '../src/components/CompleteScreen';

// Mock the sounds module since jsdom doesn't have Web Audio API
vi.mock('../src/utils/sounds', () => ({
  playCelebration: vi.fn(),
}));

describe('CompleteScreen', () => {
  it('should show encouragement text', () => {
    render(<CompleteScreen image="test.png" startTime={Date.now() - 45000}
      onPlayAgain={() => {}} onChooseImage={() => {}} />);
    const el = document.querySelector('.complete-screen__encouragement');
    expect(el).not.toBeNull();
    expect(el!.textContent).toBeTruthy();
  });

  it('should show complete image', () => {
    render(<CompleteScreen image="test.png" startTime={Date.now() - 45000}
      onPlayAgain={() => {}} onChooseImage={() => {}} />);
    expect((document.querySelector('.complete-screen__image img') as HTMLImageElement).src).toContain('test.png');
  });

  it('should show play again button', () => {
    let called = false;
    render(<CompleteScreen image="test.png" startTime={Date.now() - 45000}
      onPlayAgain={() => { called = true; }} onChooseImage={() => {}} />);
    fireEvent.click(document.querySelector('.play-again-btn')!);
    expect(called).toBe(true);
  });

  it('should show choose image button', () => {
    let called = false;
    render(<CompleteScreen image="test.png" startTime={Date.now() - 45000}
      onPlayAgain={() => {}} onChooseImage={() => { called = true; }} />);
    fireEvent.click(document.querySelector('.choose-image-btn')!);
    expect(called).toBe(true);
  });
});