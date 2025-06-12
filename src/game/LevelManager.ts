import { ConfigResponse } from '../types/config.type';
import { SegmentScenes } from './SegmentScene';

export class LevelManager {
  private static instance: LevelManager;
  private gameSettings: ConfigResponse[] | null = null;
  private currentLevelIndex: number = -1;
  private currentFonemaIndex: number = -1;
  private game: Phaser.Game | null = null;

  private constructor() {}

  public static getInstance(): LevelManager {
    if (!LevelManager.instance) {
      LevelManager.instance = new LevelManager();
    }
    return LevelManager.instance;
  }

  public setGame(game: Phaser.Game): void {
    this.game = game;
  }

  public setGameSettings(settings: ConfigResponse[]): void {
    this.gameSettings = settings;
  }

  public startFirstLevel(): void {
    this.currentLevelIndex = 0;
    this.currentFonemaIndex = 0;
    if (this.gameSettings && this.gameSettings.length > 0) {
      const firstSegment = this.gameSettings[0].segmento;
      this.game?.scene.start(firstSegment);
    }
  }

  public goToNextFonema(): boolean {
    if (!this.gameSettings || this.currentLevelIndex < 0) return false;
    
    this.currentFonemaIndex++;
    console.log('Current fonema index:', this.currentFonemaIndex);
    const currentLevel = this.gameSettings[this.currentLevelIndex];

    if (!SegmentScenes[currentLevel.segmento]) {
      return false;
    }
    
    if (this.currentFonemaIndex < currentLevel.fonemas.length) {
      return true;
    } else {
      this.currentFonemaIndex = 0;
      return false;
    }
  }

  public goToNextLevel(): void {
    if (!this.gameSettings || !this.game) return;

    // Detener sonidos y la escena actual
    this.game.sound.stopAll();
    this.game.scene.stop(this.gameSettings[this.currentLevelIndex].segmento);
    
    this.currentLevelIndex++;
    console.log('Current level index:', this.currentLevelIndex);
    this.currentFonemaIndex = 0;
    
    if (this.currentLevelIndex < this.gameSettings.length) {
      const nextSegment = this.gameSettings[this.currentLevelIndex].segmento;
      if (SegmentScenes[nextSegment]) {
        // En lugar de ir directamente al siguiente nivel, mostrar la pantalla de transición
        this.game.scene.start('LevelTransition');
      } else {
        this.game.scene.start('GameOver');
      }
    } else {
      this.game.scene.start('GameOver');
    }
  }

  public getCurrentLevel(): ConfigResponse | null {
    if (!this.gameSettings || this.currentLevelIndex < 0 || this.currentLevelIndex >= this.gameSettings.length) {
      return null;
    }
    return this.gameSettings[this.currentLevelIndex];
  }

  public getCurrentFonema(): string | null {
    const currentLevel = this.getCurrentLevel();
    if (!currentLevel || this.currentFonemaIndex < 0 || this.currentFonemaIndex >= currentLevel.fonemas.length) {
      return null;
    }
    return currentLevel.fonemas[this.currentFonemaIndex];
  }

  public getFonemaIndex(): number {
    return this.currentFonemaIndex;
  }

  public getCurrentLevelIndex(): number {
    return this.currentLevelIndex;
  }

  public getTotalLevels(): number {
    return this.gameSettings ? this.gameSettings.length : 0;
  }

  public getProgress(): { currentLevel: number; totalLevels: number; percentage: number } {
    const totalLevels = this.getTotalLevels();
    const currentLevel = this.currentLevelIndex + 1;
    const percentage = totalLevels > 0 ? (currentLevel / totalLevels) * 100 : 0;
    
    return {
      currentLevel,
      totalLevels,
      percentage
    };
  }
}