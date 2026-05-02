import { useState, useRef } from 'react';
import { PRESET_IMAGES, DIFFICULTY_OPTIONS } from '../constants';
import type { DifficultyLevel } from '../types';
import { compressImage } from '../utils/imageCompress';
import './StartScreen.css';

interface StartScreenProps {
  onStartGame: (image: string, difficulty: DifficultyLevel) => void;
}

export function StartScreen({ onStartGame }: StartScreenProps) {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (url: string) => {
    setSelectedImage(url);
    setUploadError('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('请选择一张图片');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        try {
          const compressed = await compressImage(dataUrl);
          setSelectedImage(compressed);
          setUploadError('');
        } catch {
          setUploadError('图片处理失败，请换一张试试');
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError('图片读取失败');
    }
  };

  const handleStartGame = () => {
    if (selectedImage) {
      onStartGame(selectedImage, difficulty);
    }
  };

  return (
    <div className="start-screen">
      <h1 className="start-screen__title">🧩 小天儿童拼图</h1>

      <div className="start-screen__images">
        {PRESET_IMAGES.map(img => (
          <div
            key={img.id}
            className={`image-card ${selectedImage === img.url ? 'image-card--selected' : ''}`}
            onClick={() => handleImageSelect(img.url)}
          >
            <img src={img.url} alt={img.name} />
            <span>{img.name}</span>
          </div>
        ))}
      </div>

      <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
        📷 从相册选一张
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="upload-input"
        onChange={handleFileUpload}
      />

      {selectedImage && selectedImage.startsWith('data:') && (
        <div className="image-card image-card--selected image-card--upload">
          <img src={selectedImage} alt="上传图片" />
          <span>我的图片</span>
        </div>
      )}

      {uploadError && <p className="start-screen__error">{uploadError}</p>}

      <div className="start-screen__difficulty">
        {DIFFICULTY_OPTIONS.map(opt => (
          <button
            key={opt.level}
            className={`difficulty-btn ${difficulty === opt.level ? 'difficulty-btn--selected' : ''}`}
            onClick={() => setDifficulty(opt.level)}
          >
            {opt.label} {'⭐'.repeat(opt.stars)}
          </button>
        ))}
      </div>

      <button
        className="start-btn"
        disabled={!selectedImage}
        onClick={handleStartGame}
      >
        开始拼图!
      </button>
    </div>
  );
}