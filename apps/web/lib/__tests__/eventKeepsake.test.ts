import {describe,it,expect} from 'vitest';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {OutingCoverHeader} from '../../components/OutingCoverHeader';
const source=(p:string)=>readFileSync(resolve(__dirname,p),'utf8');
describe('Event keepsake presentation',()=>{
  it('styles all three home lists and all four Outings lists without changing action wiring',()=>{
    const home=source('../../app/home/page.tsx');
    const outings=source('../../app/outings/page.tsx');
    expect(home.match(/className=\{keepsake.card\}/g)).toHaveLength(3);
    expect(outings.match(/className=\{keepsake.card\}/g)).toHaveLength(4);
    for(const text of ['handleDeletePitch(item.id)','handleToggleRadarJoin(item.id)','Joined ✓','Join Pitch →','View Record →','Edit Pitch','guest.status','item.dateTime','item.hostName','item.pitch']) expect(home).toContain(text);
    for(const text of ['handleJoinInvite(item)','handlePassInvite(item)','disabled={isBusy}','Manage Pitch →','Rhythm Check →','Joined ✓']) expect(outings).toContain(text);
  });
  it('keeps original cover, alternative text and photographer credit',()=>{
    const html=renderToStaticMarkup(React.createElement(OutingCoverHeader,{cover_image_url:'/original.jpg',cover_image_alt:'Original event photo',cover_photographer_name:'Photographer',cover_photographer_url:'https://unsplash.com/@photographer'}));
    for(const text of ['/original.jpg','Original event photo','Photographer','utm_source=soul_tribe','data-outing-cover']) expect(html).toContain(text);
  });
  it('scopes the paper style and does not truncate event descriptions',()=>{
    const css=source('../../components/EventKeepsake.module.css');
    expect(css).toContain('/images/crumpled-letter.jpg');
    expect(css).toContain('focus-visible');
    expect(css).not.toMatch(/line-clamp|text-overflow:\s*ellipsis/);
  });
});
