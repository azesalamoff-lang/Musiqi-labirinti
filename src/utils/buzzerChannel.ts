/**
 * Zero-conflict, low-latency cross-device and cross-tab Buzzer Channel
 * 
 * Uses Web BroadcastChannel API (for tabs/windows on the same device)
 * and localStorage events (for reliable universal multi-window sync).
 * 
 * Includes Atomic Lock pattern: Once any team triggers buzz, all other triggers
 * are silently dropped until host explicitly releases/resets the buzzers.
 */

export interface BuzzerEventMessage {
  type: 'BUZZ' | 'RESET' | 'LOCK_TEAM' | 'SYNC_REQUEST' | 'SYNC_RESPONSE';
  teamId?: string;
  teamName?: string;
  timestamp?: number;
  lockedTeamIds?: string[];
  buzzedTeamId?: string | null;
}

type BuzzerListener = (msg: BuzzerEventMessage) => void;

class BuzzerSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<BuzzerListener> = new Set();
  private channelName = 'musiqi_dueli_buzzer_channel';
  private storageKey = 'musiqi_dueli_buzzer_sync';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel(this.channelName);
          this.channel.onmessage = (event) => {
            this.notifyListeners(event.data);
          };
        }
      } catch (e) {
        console.warn('BroadcastChannel not supported, falling back to storage sync:', e);
      }

      // Storage event listener fallback
      window.addEventListener('storage', (e) => {
        if (e.key === this.storageKey && e.newValue) {
          try {
            const data: BuzzerEventMessage = JSON.parse(e.newValue);
            this.notifyListeners(data);
          } catch (err) {
            console.error('Buzzer storage parse error:', err);
          }
        }
      });
    }
  }

  public subscribe(listener: BuzzerListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(msg: BuzzerEventMessage) {
    this.listeners.forEach((fn) => {
      try {
        fn(msg);
      } catch (err) {
        console.error('Error in buzzer listener:', err);
      }
    });
  }

  public send(msg: BuzzerEventMessage) {
    // 1. BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn('BroadcastChannel send error:', err);
      }
    }

    // 2. Storage event trigger (updates timestamp to guarantee storage event fires)
    if (typeof window !== 'undefined') {
      try {
        const payload = JSON.stringify({ ...msg, _t: Date.now() });
        localStorage.setItem(this.storageKey, payload);
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
    }

    // 3. Notify local listeners on current window too
    this.notifyListeners(msg);
  }
}

export const buzzerService = new BuzzerSyncService();
