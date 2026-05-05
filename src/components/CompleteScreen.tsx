import { useEffect, useState } from 'react';
import { ENCOURAGEMENTS } from '../constants';
import { playCelebration } from '../utils/sounds';
import './CompleteScreen.css';

interface CompleteScreenProps {
  image: string;
  startTime: number;
  onPlayAgain: () => void;
  onChooseImage: () => void;
}

export function CompleteScreen({
  image,
  startTime,
  onPlayAgain,
  onChooseImage,
}: CompleteScreenProps) {
  const [encouragement] = useState(
    () => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
  );

  const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

  useEffect(() => {
    playCelebration();
  }, []);

  return (
    <div className="complete-screen">
      <div className="complete-screen__badge">🎯 拼图完成</div>
      <div className="complete-screen__celebration">🎉🎉🎉</div>
      <div className="complete-screen__encouragement">{encouragement}</div>
      <div className="complete-screen__image">
        <img src={image} alt="完成图" />
      </div>
      <div className="complete-screen__time">
        用时 {elapsedSeconds} 秒
      </div>
      <div className="complete-screen__actions">
        <button className="play-again-btn" onClick={onPlayAgain}>
          再来一次
        </button>
        <button className="choose-image-btn" onClick={onChooseImage}>
          换个图片
        </button>
      </div>
    </div>
  );
}