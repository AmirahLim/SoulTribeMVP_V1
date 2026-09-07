import {describe,it,expect} from 'vitest';
import {readFileSync} from 'fs';
import {resolve} from 'path';

const css=readFileSync(resolve(__dirname,'../../app/onboarding/onboarding.css'),'utf8');
const layout=readFileSync(resolve(__dirname,'../../app/layout.tsx'),'utf8');

describe('Onboarding alignment',()=>{
  it('centres all six question headings and answer groups',()=>{
    expect(css).toContain('.ob-immersive .ob-content { width: 100%; max-width: 600px; text-align: center; }');
    expect(css).toContain('.ob-immersive .ob-choices { justify-content: center;');
    expect(css).toContain('.ob-immersive:not([data-step="7"]) :is(.ob-rhythm fieldset,.ob-q4-parts) { text-align: center; }');
    expect(css).toContain('.ob-immersive:not([data-step="7"]) :is(.ob-rhythm,.ob-q4-parts) .ob-choices { justify-content: center; }');
    expect(css).toContain('.ob-immersive .ob-layout { align-items: center; padding-top: 0; }');
    expect(css).toContain('.ob-immersive .ob-content { width: min(100%, 600px); margin-left: auto; margin-right: auto; }');
    expect(layout).toContain("width: 'device-width'");
    expect(layout).toContain('initialScale: 1');
  });
});
