class SoundManager {
    private context: AudioContext | null = null;

    private getContext() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.context;
    }

    playTone(freq: number, type: OscillatorType, duration: number, startTime = 0) {
        const ctx = this.getContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }

    playSuccess() {
        // C Major Arpeggio
        this.playTone(523.25, 'sine', 0.5, 0);       // C5
        this.playTone(659.25, 'sine', 0.5, 0.1);     // E5
        this.playTone(783.99, 'sine', 0.5, 0.2);     // G5
        this.playTone(1046.50, 'sine', 0.8, 0.3);    // C6
    }

    playError() {
        // Soft error
        this.playTone(200, 'triangle', 0.3, 0);
        this.playTone(150, 'triangle', 0.4, 0.1);
    }

    playPop() {
        this.playTone(800, 'sine', 0.1, 0);
    }

    playCoin() {
        this.playTone(1200, 'sine', 0.1, 0);
        this.playTone(1600, 'sine', 0.4, 0.05);
    }
}

export const sfx = new SoundManager();
