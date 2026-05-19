import { Component, Input, OnChanges } from '@angular/core';

/**
 * Circular member avatar.
 * Shows the profile photo when available; falls back to a colored circle
 * with the member's initials.
 *
 * Usage:
 *   <app-member-avatar [name]="member.fullName"
 *                      [imageUrl]="member.profileImageUrl"
 *                      [size]="80">
 *   </app-member-avatar>
 */
@Component({
  selector: 'app-member-avatar',
  template: `
    <div class="avatar-circle"
         [style.width.px]="size"
         [style.height.px]="size"
         [style.font-size.px]="size * 0.38"
         [style.background]="imageUrl ? 'transparent' : bgColor">
      @if (imageUrl) {
        <img [src]="imageUrl" [alt]="name" (error)="onImgError()" class="avatar-img">
      } @else {
        <span class="avatar-initials">{{ initials }}</span>
      }
    </div>
  `,
  styles: [`
    .avatar-circle {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar-initials {
      color: #fff;
      font-weight: 700;
      line-height: 1;
      user-select: none;
    }
  `]
})
export class MemberAvatarComponent implements OnChanges {
  @Input() name = '';
  @Input() imageUrl?: string | null;
  @Input() size = 40;

  initials = '';
  bgColor  = '#3f51b5';

  // Palette for deterministic colour from name hash
  private static readonly COLORS = [
    '#3f51b5','#e91e63','#009688','#ff5722',
    '#607d8b','#795548','#673ab7','#2196f3',
    '#4caf50','#ff9800'
  ];

  ngOnChanges(): void {
    this.initials = this.buildInitials(this.name);
    this.bgColor  = this.colorFor(this.name);
  }

  /** Fall back to initials if the image fails to load (404, broken URL etc.) */
  onImgError(): void {
    this.imageUrl = null;
  }

  private buildInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private colorFor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return MemberAvatarComponent.COLORS[Math.abs(hash) % MemberAvatarComponent.COLORS.length];
  }
}
