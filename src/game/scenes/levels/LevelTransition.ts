import { Scene } from "phaser";
import { LevelManager } from "../../LevelManager";
import { ConfigResponse } from "../../../types/config.type";

export class LevelTransition extends Scene {
    private levelManager: LevelManager;
    private background: Phaser.GameObjects.Image;
    private titleText: Phaser.GameObjects.Text;
    private levelText: Phaser.GameObjects.Text;
    private progressText: Phaser.GameObjects.Text;
    private progressBar: Phaser.GameObjects.Graphics;
    private progressBarBg: Phaser.GameObjects.Graphics;

    private baseWidth = 1024;
    private baseHeight = 768;
    
    // Referencias para redimensionamiento
    private gameWidth: number = 0;
    private gameHeight: number = 0;

    constructor() {
        super({ key: 'LevelTransition' });
        this.levelManager = LevelManager.getInstance();
    }

    create() {
        // Obtener dimensiones actuales
        const { width, height } = this.scale.gameSize;
        this.gameWidth = width;
        this.gameHeight = height;

        // Fondo con gradiente
        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);

        // Obtener información del nivel actual
        const currentLevel = this.levelManager.getCurrentLevel();
        const levelIndex = this.levelManager.getCurrentLevelIndex();
        const totalLevels = this.levelManager.getTotalLevels();

        // Crear elementos de la UI
        this.createUIElements(currentLevel, levelIndex, totalLevels);
        
        // Configurar responsividad
        this.setupResponsive();
        
        // Aplicar posicionamiento inicial
        this.updateLayout();

        // Animaciones
        this.playEntranceAnimations();

        // Timer para continuar al siguiente nivel después de 5 segundos
        this.time.delayedCall(3000, () => {
            this.proceedToNextLevel();
        });
    }

    private createUIElements(currentLevel: ConfigResponse | null, levelIndex: number, totalLevels: number): void {
        // Título principal
        this.titleText = this.add.text(0, 0, '¡Nivel Completado!', {
            fontFamily: 'Arial Black',
            fontSize: this.getResponsiveFontSize(48),
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: this.getResponsiveStroke(8),
            align: 'center'
        }).setOrigin(0.5);

        // Información del siguiente nivel
        if (currentLevel) {
            this.levelText = this.add.text(0, 0, 
                `Siguiente: ${currentLevel.segmento.toUpperCase()}`, {
                    fontFamily: 'Arial Black',
                    fontSize: this.getResponsiveFontSize(28),
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: this.getResponsiveStroke(8),
                    align: 'center'
                }).setOrigin(0.5);
        }

        // Barra de progreso del fondo
        this.progressBarBg = this.add.graphics();
        
        // Barra de progreso
        this.progressBar = this.add.graphics();

        // Texto de progreso
        this.progressText = this.add.text(0, 0, 
            `Nivel ${levelIndex + 1} de ${totalLevels}`, {
                fontFamily: 'Arial Black',
                fontSize: this.getResponsiveFontSize(24),
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: this.getResponsiveStroke(8),
                align: 'center'
            }).setOrigin(0.5);
    }

    private setupResponsive(): void {
        // Escuchar cambios de tamaño
        this.scale.on('resize', this.onResize, this);
        
        // Configurar el redimensionamiento
        this.onResize({ width: this.gameWidth, height: this.gameHeight });
    }

    private updateLayout(): void {
        const { width, height } = this.scale.gameSize;
        
        // Posicionar elementos
        this.titleText.setPosition(width / 2, height * 0.3);
        
        if (this.levelText) {
            this.levelText.setPosition(width / 2, height * 0.5);
        }
        
        // Actualizar barras de progreso
        this.updateProgressBars();
        
        // Posicionar texto de progreso
        this.progressText.setPosition(width / 2, height * 0.75);
    }

    private updateProgressBars(): void {
        const { width, height } = this.scale.gameSize;
        const levelIndex = this.levelManager.getCurrentLevelIndex();
        const totalLevels = this.levelManager.getTotalLevels();
        
        // Calcular dimensiones responsivas de la barra
        const barWidth = Math.min(width * 0.6, 600); // Máximo 600px
        const barHeight = this.getResponsiveBarHeight();
        const barX = (width - barWidth) / 2;
        const barY = height * 0.7;
        const cornerRadius = Math.min(barHeight / 2, 10);

        // Limpiar gráficos anteriores
        this.progressBarBg.clear();
        this.progressBar.clear();

        // Barra de fondo
        this.progressBarBg.fillStyle(0x222222, 0.5);
        this.progressBarBg.fillRoundedRect(barX, barY, barWidth, barHeight, cornerRadius);

        // Barra de progreso
        const progress = (levelIndex + 1) / totalLevels;
        this.progressBar.fillStyle(0x00FF00);
        this.progressBar.fillRoundedRect(barX, barY, barWidth * progress, barHeight, cornerRadius);
    }

    private getResponsiveFontSize(baseFontSize: number): number {
        const { width, height } = this.scale.gameSize;
        const scale = Math.min(width / this.baseWidth, height / this.baseHeight);
        return Math.max(baseFontSize * scale, baseFontSize * 0.5); // Mínimo 50% del tamaño base
    }

    private getResponsiveStroke(baseStroke: number): number {
        const { width, height } = this.scale.gameSize;
        const scale = Math.min(width / this.baseWidth, height / this.baseHeight);
        return Math.max(baseStroke * scale, 2); // Mínimo 2px de stroke
    }

    private getResponsiveBarHeight(): number {
        const { height } = this.scale.gameSize;
        const baseHeight = 20;
        const scale = height / this.baseHeight;
        return Math.max(baseHeight * scale, 15); // Mínimo 15px de altura
    }

    private onResize(gameSize: { width: number; height: number }): void {
        const { width, height } = gameSize;
        this.gameWidth = width;
        this.gameHeight = height;

        // Actualizar fondo con escala tipo "cover"
        const scaleX = width / this.baseWidth;
        const scaleY = height / this.baseHeight;
        const coverScale = Math.max(scaleX, scaleY);

        this.background
            .setScale(coverScale)
            .setPosition(
                (width - this.baseWidth * coverScale) * 0.5,
                (height - this.baseHeight * coverScale) * 0.5
            );

        // Actualizar fuentes y elementos
        if (this.titleText) {
            this.titleText.setFontSize(this.getResponsiveFontSize(48));
            this.titleText.setStroke('#000000', this.getResponsiveStroke(8));
        }

        if (this.levelText) {
            this.levelText.setFontSize(this.getResponsiveFontSize(28));
            this.levelText.setStroke('#000000', this.getResponsiveStroke(8));
        }

        if (this.progressText) {
            this.progressText.setFontSize(this.getResponsiveFontSize(24));
            this.progressText.setStroke('#000000', this.getResponsiveStroke(8));
        }

        // Actualizar layout
        this.updateLayout();
    }

    private playEntranceAnimations(): void {
        // Preparar elementos para animación
        this.titleText.setScale(0);
        this.levelText?.setScale(0);
        this.progressBar.setScale(0, 1);

        // Animación del título
        this.tweens.add({
            targets: this.titleText,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });

        // Animación del texto del nivel
        if (this.levelText) {
            this.tweens.add({
                targets: this.levelText,
                scale: 1,
                duration: 500,
                delay: 200,
                ease: 'Back.easeOut'
            });
        }

        // Animación de la barra de progreso
        this.tweens.add({
            targets: this.progressBar,
            scaleX: 1,
            duration: 800,
            delay: 400,
            ease: 'Power2.easeOut'
        });

        // Animación del texto de progreso
        this.progressText.setAlpha(0);
        this.tweens.add({
            targets: this.progressText,
            alpha: 1,
            duration: 300,
            delay: 600,
            ease: 'Power2.easeOut'
        });
    }

    private proceedToNextLevel(): void {
        // Animación de salida
        const elementsToAnimate = [this.titleText, this.progressText];
        if (this.levelText) {
            elementsToAnimate.push(this.levelText);
        }

        this.tweens.add({
            targets: elementsToAnimate,
            alpha: 0,
            scale: 0.5,
            duration: 300,
            ease: 'Power2.easeIn',
            onComplete: () => {
                // Continuar al siguiente nivel
                const currentLevel = this.levelManager.getCurrentLevel();
                if (currentLevel) {
                    this.scene.start(currentLevel.segmento);
                } else {
                    this.scene.start('GameOver');
                }
            }
        });

        // Animación de salida de las barras de progreso
        this.tweens.add({
            targets: [this.progressBar, this.progressBarBg],
            alpha: 0,
            scaleY: 0,
            duration: 300,
            ease: 'Power2.easeIn'
        });
    }

    destroy(): void {
        // Limpiar listeners
        this.scale.off('resize', this.onResize, this);
        // Destruir elementos gráficos
        this.background.destroy();
        this.titleText.destroy();
        this.levelText?.destroy();
        this.progressText.destroy();
        this.progressBar.destroy();
        this.progressBarBg.destroy();
    }
}