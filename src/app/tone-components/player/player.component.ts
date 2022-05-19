import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit, AfterViewInit {
  @Input() audioURL$: any
 

  @ViewChild('stream') audioRef!: ElementRef<HTMLAudioElement>;

  @ViewChild('rangeRef') rangeRef!: any

  get $player(): HTMLAudioElement {
    return this.audioRef.nativeElement;
  }

  // audioFile = document.getElementsByTagName('audio')[0];
  

  constructor() { }

  ngOnInit(): void {
    
  }

  ngAfterViewInit() {
  
    console.log(this.$player.volume = .5);
  }

  slideVoluem(v: any, e: Event) {
    console.log('range value',v)
    this.$player.volume = v

  }

}
