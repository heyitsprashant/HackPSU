import { GoogleGenerativeAI } from '@google/generative-ai';

interface AutomationConfig {
  apiKey: string;
  model: string;
}

interface ScreenElement {
  type: 'button' | 'input' | 'text' | 'link';
  selector: string;
  text?: string;
  position?: { x: number; y: number };
}

class GeminiAutomation {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(config: AutomationConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.model || 'gemini-2.5-flash' });
  }

  /**
   * Analyzes screenshot to identify UI elements
   */
  async analyzeScreen(screenshot: File): Promise<ScreenElement[]> {
    try {
      const imageData = await this.fileToGenerativePart(screenshot);
      
      const prompt = `
        Analyze this screenshot and identify interactive UI elements.
        Focus on:
        1. Buttons (especially "Start Practice Session" or similar)
        2. Input fields (especially email inputs)
        3. Navigation links
        4. Clickable elements
        
        Return a JSON array of elements with their type, position, and identifying text.
        Format: [{"type": "button", "text": "Start Practice Session", "position": {"x": 100, "y": 200}, "selector": "#start-practice"}]
      `;

      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse Gemini response:', e);
        return [];
      }
    } catch (error) {
      console.error('Error analyzing screen:', error);
      return [];
    }
  }

  /**
   * Finds specific element by text content
   */
  async findElement(screenshot: File, elementText: string): Promise<ScreenElement | null> {
    const elements = await this.analyzeScreen(screenshot);
    return elements.find(el => 
      el.text?.toLowerCase().includes(elementText.toLowerCase())
    ) || null;
  }

  /**
   * Simulates click on element
   */
  async clickElement(element: ScreenElement): Promise<boolean> {
    try {
      if (element.selector) {
        const domElement = document.querySelector(element.selector);
        if (domElement instanceof HTMLElement) {
          domElement.click();
          return true;
        }
      }
      
      if (element.position) {
        // Simulate click at position
        const clickEvent = new MouseEvent('click', {
          clientX: element.position.x,
          clientY: element.position.y,
          bubbles: true
        });
        
        const targetElement = document.elementFromPoint(element.position.x, element.position.y);
        if (targetElement) {
          targetElement.dispatchEvent(clickEvent);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error clicking element:', error);
      return false;
    }
  }

  /**
   * Takes screenshot of current page
   */
  async captureScreen(): Promise<File | null> {
    try {
      // Use browser's screen capture API if available
      if ('getDisplayMedia' in navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' }
        });
        
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        stream.getTracks().forEach(track => track.stop());
        
        return new Promise(resolve => {
          canvas.toBlob(blob => {
            resolve(blob ? new File([blob], 'screenshot.png', { type: 'image/png' }) : null);
          });
        });
      }
      
      // Fallback: use html2canvas if available
      if (typeof window !== 'undefined' && (window as any).html2canvas) {
        const canvas = await (window as any).html2canvas(document.body);
        return new Promise(resolve => {
          canvas.toBlob((blob: Blob) => {
            resolve(new File([blob], 'screenshot.png', { type: 'image/png' }));
          });
        });
      }
      
      return null;
    } catch (error) {
      console.error('Error capturing screen:', error);
      return null;
    }
  }

  /**
   * Convert file to format needed for Gemini
   */
  private async fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve(base64Data);
      };
      reader.readAsDataURL(file);
    });
    
    return {
      inlineData: {
        data: await base64EncodedDataPromise,
        mimeType: file.type,
      },
    };
  }
}

/**
 * Automation workflow for study practice to interview coach flow
 */
export class StudyPracticeAutomation {
  private geminiAutomation: GeminiAutomation;

  constructor(apiKey: string) {
    this.geminiAutomation = new GeminiAutomation({
      apiKey,
      model: 'gemini-2.5-flash'
    });
  }

  /**
   * Automated flow: Email input -> Start Practice -> Interview Coach
   */
  async automateStudyFlow(emailContent: string): Promise<boolean> {
    try {
      console.log('Starting automated study practice flow...');
      
      // Step 1: Take screenshot to analyze current state
      const screenshot = await this.geminiAutomation.captureScreen();
      if (!screenshot) {
        console.error('Failed to capture screen');
        return false;
      }

      // Step 2: Find and fill email input if needed
      const emailInput = await this.geminiAutomation.findElement(screenshot, 'email content');
      if (emailInput && emailInput.selector) {
        const inputElement = document.querySelector(emailInput.selector) as HTMLTextAreaElement;
        if (inputElement && !inputElement.value) {
          inputElement.value = emailContent;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('Email content filled automatically');
        }
      }

      // Step 3: Find and click "Parse Email" or "Start Practice" button
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay
      
      const updatedScreenshot = await this.geminiAutomation.captureScreen();
      if (!updatedScreenshot) return false;

      const startButton = await this.geminiAutomation.findElement(
        updatedScreenshot, 
        'start practice session'
      );
      
      if (startButton) {
        const clicked = await this.geminiAutomation.clickElement(startButton);
        if (clicked) {
          console.log('Start Practice button clicked automatically');
          
          // Step 4: Navigate to interview coach after brief delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Trigger navigation to interview coach
          window.location.href = '/dashboard/mentor';
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Automation flow failed:', error);
      return false;
    }
  }

  /**
   * Monitor for specific UI states and trigger actions
   */
  async monitorAndAutomate(): Promise<void> {
    const monitor = setInterval(async () => {
      try {
        const screenshot = await this.geminiAutomation.captureScreen();
        if (!screenshot) return;

        // Look for "Start Practice Session" button
        const practiceButton = await this.geminiAutomation.findElement(
          screenshot,
          'start practice session'
        );

        if (practiceButton) {
          console.log('Practice session button detected, auto-clicking...');
          const clicked = await this.geminiAutomation.clickElement(practiceButton);
          
          if (clicked) {
            // Navigate to interview coach
            setTimeout(() => {
              window.location.href = '/dashboard/mentor';
            }, 1000);
            
            clearInterval(monitor);
          }
        }
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, 2000); // Check every 2 seconds

    // Stop monitoring after 30 seconds
    setTimeout(() => {
      clearInterval(monitor);
    }, 30000);
  }
}

export default GeminiAutomation;