// A receipt after the story moment, so the characters need not explain equipment rules.
export class KeepsakeView {
  private root=document.createElement('section');
  private cleanup=new AbortController();
  constructor(hasRoom:boolean,onEquip:()=>void,onClose:()=>void) {
    this.root.className='battle keepsake-award';
    this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');
    this.root.setAttribute('aria-labelledby','keepsake-award-title');
    this.root.innerHTML=`<div class="keepsake-receipt">
      <p class="eyebrow">A KEEPSAKE FROM THE BEAR</p>
      <svg class="keepsake-link" viewBox="0 0 32 32" aria-hidden="true" shape-rendering="crispEdges"><path d="M10 3h12v3h4v4h3v12h-3v4h-4v3H10v-3H6v-4H3V10h3V6h4z" fill="#6e7568"/><path d="M11 7h10v3h4v12h-4v3H11v-3H7V10h4z" fill="#bcb79a"/><path d="M12 11h8v2h2v7h-2v2h-8v-2h-2v-7h2z" fill="#172321"/><path d="M21 3h11v8H21z" fill="#172321"/><path d="M19 4h3v3h-3zM25 10h4v3h-4z" fill="#dbcdaa"/></svg>
      <h2 id="keepsake-award-title">Broken mill-chain link</h2>
      <p class="keepsake-inscription">Worn thin where it met the stone. Warm where he held it.</p>
      <dl><div><dt>A memory held</dt><dd>You will always remember the bear. This bond survives death and does not use an anchor or equipment slot.</dd></div>
      <div><dt>When worn by the bear</dt><dd>Protect covers both allies and himself against physical attacks.<br><span>Costs 3 mana and his action. Spells still require barriers.</span></dd></div></dl>
      <div class="keepsake-receipt-actions"><button type="button" data-keep>${hasRoom?'Equip on the bear':'Choose an equipment slot'}</button><button type="button" data-close>Keep in the pack</button></div>
    </div>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal=this.cleanup.signal;
    this.root.querySelector('[data-keep]')!.addEventListener('click',onEquip,{signal});
    this.root.querySelector('[data-close]')!.addEventListener('click',onClose,{signal});
    this.root.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}
      if(event.key==='Tab'){
        event.preventDefault();event.stopPropagation();
        const buttons=Array.from(this.root.querySelectorAll<HTMLButtonElement>('button'));
        const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
        buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length].focus();
      }
    },{signal});
    this.root.querySelector<HTMLButtonElement>('[data-keep]')!.focus({preventScroll:true});
  }
  destroy(){this.cleanup.abort();this.root.remove();}
}
