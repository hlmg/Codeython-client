import React, { useEffect } from 'react';
import { create } from 'zustand';
import styles from './ProgressBar.module.scss';

// Zustand 상태 타입 정의
interface ProgressState {
  progress: number;
  setProgress: (value: number) => void;
}

// 초기 상태
const initialState: ProgressState = {
  progress: 0,
  setProgress: () => {},
};

// Zustand 스토어 생성
const useProgressStore = create<ProgressState>((set) => ({
  ...initialState,
  setProgress: (value: number) => set({ progress: value }),
}));

// 현재 시간/남은 시간을 토글하는 상태 관리
interface TimeDisplayState {
  showElapsedTime: boolean;
  toggleTimeDisplay: () => void;
}

const useTimeDisplayStore = create<TimeDisplayState>((set) => ({
  showElapsedTime: true,
  toggleTimeDisplay: () => set((state) => ({ showElapsedTime: !state.showElapsedTime })),
}));

const TimeDisplay: React.FC<{ timeInSeconds: number }> = ({ timeInSeconds }) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return <div>{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</div>;
};

const ProgressBar: React.FC<{ limitTime: number }> = ({ limitTime }) => {
  const { progress, setProgress } = useProgressStore();
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [remainingTime, setRemainingTime] = React.useState(limitTime * 60);
  const { showElapsedTime, toggleTimeDisplay } = useTimeDisplayStore(); 

  useEffect(() => {
    const startTime = Date.now();
    const limitTimeMilliseconds = limitTime * 60 * 1000;
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedMilliseconds = currentTime - startTime;
      const remainingMilliseconds = Math.max(limitTimeMilliseconds - elapsedMilliseconds, 0);
      setElapsedTime(elapsedMilliseconds);
      setRemainingTime(remainingMilliseconds / 1000); // 초 단위로 설정
      const progressPercentage = (elapsedMilliseconds / limitTimeMilliseconds) * 100;
      setProgress(progressPercentage);
      if (elapsedMilliseconds >= limitTimeMilliseconds) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [limitTime, setProgress]); // setProgress를 의존성 배열에 추가

  // 클릭 이벤트 핸들러 함수
  const handleTimeDisplayClick = () => {
    toggleTimeDisplay(); // 상태 토글
  };

  return (
    <div className={styles.progress_container}>
      <div className={styles.progress_bar__container}>
        <div
          className={styles.progressed_bar}
          style={{ width: `${progress}%`, height: '100%' }}
        />
      </div>
      <img
        src='/Imgs/running_person.png'
        alt="running_person"
        className={styles.running_icon}
        style={{ left: `${progress}%` }}
      />
      <div className={styles.time_display_container}>
        <div className={styles.elapsed_time} onClick={handleTimeDisplayClick}>
          <TimeDisplay timeInSeconds={showElapsedTime ? elapsedTime / 1000 : remainingTime} />
        </div>
        <div className={styles.limit_time}>
          <TimeDisplay timeInSeconds={limitTime * 60} /> {/* 초 단위로 전달 */}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
