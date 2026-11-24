import { Fixture, SocialPosterTemplate, SocialPosterTheme, Squad } from '../types';
import { formatDateMMDDYYYY, formatPosterBannerDate, toIsoDateString } from './dateFormat';

export interface PosterRenderOptions {
  template: SocialPosterTemplate;
  headline: string;
  subText: string;
  themeColor: SocialPosterTheme;
  activeFixture?: Fixture;
  slateFixtures: Fixture[];
  squads: Squad[];
  seasonYear: number;
  headerFontScale?: number;
}

export interface PosterDateGroup {
  dateKey: string;
  bannerLabel: string;
  fixtures: Fixture[];
}

export function getPosterSquadCode(squadId: string): string {
  const match = /^u(\d+)$/i.exec(squadId.trim());
  if (match) return `U${match[1]}`;
  if (squadId === 'community') return 'SNR';
  return squadId.toUpperCase().slice(0, 5);
}

function getSquadSortOrder(squadId: string, squads: Squad[]): number {
  const idx = squads.findIndex(s => s.id === squadId);
  if (idx !== -1) return idx;
  const match = /^u(\d+)$/i.exec(squadId.trim());
  if (match) return Number(match[1]);
  return 99;
}

/**
 * Groups ALL provided fixtures chronologically by date, sorting rows within each day
 * by squad progression and kickoff time. Never truncates or slices fixtures.
 */
export function groupFixturesByDate(fixtures: Fixture[], squads: Squad[]): PosterDateGroup[] {
  const map = new Map<string, Fixture[]>();

  for (const fix of fixtures) {
    const key = toIsoDateString(fix.date) || fix.date || 'TBD';
    const existing = map.get(key);
    if (existing) {
      existing.push(fix);
    } else {
      map.set(key, [fix]);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, list]) => {
      const sorted = [...list].sort((a, b) => {
        const sqDiff = getSquadSortOrder(a.squadId, squads) - getSquadSortOrder(b.squadId, squads);
        if (sqDiff !== 0) return sqDiff;
        return (a.kickoffTime || '').localeCompare(b.kickoffTime || '');
      });
      return {
        dateKey,
        bannerLabel: formatPosterBannerDate(dateKey),
        fixtures: sorted,
      };
    });
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawNotchedRibbon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  notchDepth: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width - notchDepth, y + height / 2);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + notchDepth, y + height / 2);
  ctx.closePath();
}

function drawFivePointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function renderPosterPngDataUrl(options: PosterRenderOptions): Promise<string> {
  const width = 1080;
  const padX = 56;
  const isLight = options.themeColor === 'white-clean';
  const isSlate = options.themeColor === 'slate-navy';

  const bgMain = isLight ? '#F8FAFC' : isSlate ? '#0F172A' : '#06183D';
  const bgHeaderTop = isLight ? '#FFFFFF' : isSlate ? '#1E293B' : '#08204F';
  const rowFill = isLight ? '#FFFFFF' : isSlate ? '#131E33' : '#06183D';
  const rowBorder = isLight ? '#0B1F3A' : '#FFFFFF';
  const dividerColor = isLight ? 'rgba(11,31,58,0.35)' : 'rgba(255,255,255,0.65)';
  const textPrimary = isLight ? '#0B1F3A' : '#FFFFFF';
  const textMuted = isLight ? '#475569' : '#CBD5E1';
  const gold = '#E5A922';
  const goldText = isLight ? '#C68B0A' : '#E8B238';
  const redAccent = '#D92027';

  const isSlateTemplate =
    options.template === 'Weekly Fixtures Slate' ||
    options.template === 'Weekend Results Slate';
  const isResults =
    options.template === 'Weekend Results Slate' || options.template === 'Full Time';

  const fixturesToRender: Fixture[] = isSlateTemplate
    ? options.slateFixtures
    : options.activeFixture
    ? [options.activeFixture]
    : [];

  const groups = groupFixturesByDate(fixturesToRender, options.squads);

  // Dynamically calculate height so ALL fixtures always fit cleanly without truncation
  const headerScale = Math.max(0.75, Math.min(1.6, options.headerFontScale ?? 1));
  const headerHeight = Math.round(400 + Math.max(0, headerScale - 1) * 70);
  const ribbonHeight = 62;
  const rowHeight = isSlateTemplate ? 96 : 148;
  const rowGap = 16;
  const groupSpacing = 34;
  const footerSpace = 100;

  let contentHeight = 0;
  if (groups.length === 0) {
    contentHeight = 260;
  } else {
    groups.forEach((group, idx) => {
      contentHeight += ribbonHeight + 24;
      contentHeight += group.fixtures.length * rowHeight + Math.max(0, group.fixtures.length - 1) * rowGap;
      if (!isSlateTemplate) {
        contentHeight += 120; // extra space for single-match venue/notes
      }
      if (idx < groups.length - 1) {
        contentHeight += groupSpacing;
      }
    });
  }

  const height = Math.max(1350, headerHeight + contentHeight + footerSpace);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to initialize canvas rendering context.');
  }

  // 1. Base Background
  ctx.fillStyle = bgMain;
  ctx.fillRect(0, 0, width, height);

  // Subtle top header gradient band
  const headerGrad = ctx.createLinearGradient(0, 0, 0, headerHeight + 40);
  headerGrad.addColorStop(0, bgHeaderTop);
  headerGrad.addColorStop(1, bgMain);
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, width, headerHeight + 40);

  // Dynamic diagonal crimson & white paint slash accents in top header (matching reference)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, headerHeight);
  ctx.clip();

  // Crimson diagonal slash
  ctx.strokeStyle = isLight ? 'rgba(217,32,39,0.22)' : 'rgba(217,32,39,0.75)';
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(280, 140);
  ctx.lineTo(540, -30);
  ctx.stroke();

  // White diagonal slash
  ctx.strokeStyle = isLight ? 'rgba(11,31,58,0.12)' : 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.moveTo(310, 148);
  ctx.lineTo(575, -24);
  ctx.stroke();

  // Subtle corner radial glow
  const glow = ctx.createRadialGradient(840, 180, 20, 840, 180, 340);
  glow.addColorStop(0, isLight ? 'rgba(217,32,39,0.06)' : 'rgba(229,169,34,0.12)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, headerHeight);
  ctx.restore();

  // 2. Top Header Content: Left Bold Title + Right Official MGFC Crest
  const logoImg = await loadImage('/assets/mgfc-logo.png');
  const crestSize = 285;
  const crestX = width - padX - crestSize + 8;
  const crestY = Math.max(36, Math.round((headerHeight - 56 - crestSize) / 2) + 14);

  if (logoImg) {
    ctx.drawImage(logoImg, crestX, crestY, crestSize, crestSize);
  }

  // Left Headline Stack (angled subtly like reference athletic poster)
  const subTitleUpper = (options.subText || "THIS WEEKEND'S").toUpperCase();
  const mainTitleUpper = (options.headline || 'FIXTURES').toUpperCase();

  let subSize = Math.round(58 * headerScale);
  ctx.font = `900 ${subSize}px Impact, "Barlow Condensed", "Arial Narrow", sans-serif`;
  while (ctx.measureText(subTitleUpper).width > 660 && subSize > 34) {
    subSize -= 3;
    ctx.font = `900 ${subSize}px Impact, "Barlow Condensed", "Arial Narrow", sans-serif`;
  }

  let mainSize = Math.round(124 * headerScale);
  ctx.font = `900 ${mainSize}px Impact, "Barlow Condensed", "Arial Narrow", sans-serif`;
  while (ctx.measureText(mainTitleUpper).width > 670 && mainSize > 54) {
    mainSize -= 5;
    ctx.font = `900 ${mainSize}px Impact, "Barlow Condensed", "Arial Narrow", sans-serif`;
  }

  const lineOffsetY = Math.round(mainSize * 0.94);
  const subBaselineY = Math.max(
    132,
    Math.min(190, Math.round((headerHeight - 62 - lineOffsetY) / 2) + Math.round(subSize * 0.55))
  );

  ctx.save();
  ctx.translate(padX + 8, subBaselineY);
  ctx.rotate(-0.04);

  ctx.textAlign = 'left';
  ctx.fillStyle = textPrimary;
  ctx.font = `900 ${subSize}px Impact, "Barlow Condensed", "Arial Narrow", sans-serif`;
  const subLines = wrapText(ctx, subTitleUpper, 665);
  ctx.fillText(subLines[0] || subTitleUpper, 0, 0);

  ctx.fillStyle = gold;
  ctx.font = `900 ${mainSize}px Impact, "Barlow Condensed", "Arial Narrow", sans-serif`;
  ctx.fillText(mainTitleUpper, 0, lineOffsetY);
  ctx.restore();

  // 3. Divider Streak with Centered Red Star (matching reference)
  const starY = headerHeight - 48;
  const starCenterX = width * 0.42;

  // Left white tapered stroke
  ctx.beginPath();
  ctx.moveTo(padX, starY + 14);
  ctx.lineTo(starCenterX - 38, starY + 2);
  ctx.lineTo(starCenterX - 38, starY + 11);
  ctx.closePath();
  ctx.fillStyle = isLight ? '#0B1F3A' : '#FFFFFF';
  ctx.fill();

  // Right white + red stroke
  ctx.beginPath();
  ctx.moveTo(starCenterX + 38, starY - 2);
  ctx.lineTo(width - padX - 240, starY - 14);
  ctx.lineTo(starCenterX + 38, starY + 7);
  ctx.closePath();
  ctx.fillStyle = redAccent;
  ctx.fill();

  // Five-point crimson star
  ctx.fillStyle = redAccent;
  drawFivePointStar(ctx, starCenterX, starY + 2, 22, 9);
  ctx.fill();

  // 4. Body: Date-Grouped Gold Ribbons + Bordered Navy Fixture Bars (NO opponent club logos)
  let currentY = headerHeight + 10;

  if (groups.length === 0) {
    drawRoundedRect(ctx, padX, currentY + 40, width - padX * 2, 160, 22);
    ctx.fillStyle = rowFill;
    ctx.fill();
    ctx.strokeStyle = rowBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = textMuted;
    ctx.font = '700 28px sans-serif';
    ctx.fillText(
      isResults
        ? 'No completed match results selected.'
        : 'No fixtures selected yet.',
      width / 2,
      currentY + 130
    );
  } else {
    for (const group of groups) {
      // Gold Notched Ribbon Date Header
      const ribbonW = Math.min(width - padX * 2 - 40, 780);
      const ribbonX = (width - ribbonW) / 2;
      drawNotchedRibbon(ctx, ribbonX, currentY, ribbonW, ribbonHeight, 26);
      ctx.fillStyle = gold;
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 34px "Arial Narrow", "Barlow Condensed", sans-serif';
      ctx.fillText(group.bannerLabel, width / 2, currentY + 43);

      currentY += ribbonHeight + 24;

      // Render EVERY fixture in this date group
      for (const fix of group.fixtures) {
        const barW = width - padX * 2;
        drawRoundedRect(ctx, padX, currentY, barW, rowHeight, 22);
        ctx.fillStyle = rowFill;
        ctx.fill();
        ctx.strokeStyle = rowBorder;
        ctx.lineWidth = 3;
        ctx.stroke();

        const sqCode = getPosterSquadCode(fix.squadId);
        const homeTeam = (fix.isHome ? 'MGFC' : fix.opponent).toUpperCase();
        const awayTeam = (fix.isHome ? fix.opponent : 'MGFC').toUpperCase();
        const homeScore = fix.isHome ? fix.mgfcScore ?? 0 : fix.opponentScore ?? 0;
        const awayScore = fix.isHome ? fix.opponentScore ?? 0 : fix.mgfcScore ?? 0;

        // Column x coordinates
        const col1CenterX = padX + 86;
        const div1X = padX + 172;
        const col2CenterX = div1X + 94;
        const div2X = div1X + 188;
        const matchAreaLeft = div2X + 24;
        const matchAreaRight = padX + barW - 28;
        const matchCenterX = (matchAreaLeft + matchAreaRight) / 2;
        const centerY = currentY + rowHeight / 2;

        // Vertical white dividers (matching attached poster)
        ctx.strokeStyle = dividerColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(div1X, currentY + 20);
        ctx.lineTo(div1X, currentY + rowHeight - 20);
        ctx.moveTo(div2X, currentY + 20);
        ctx.lineTo(div2X, currentY + rowHeight - 20);
        ctx.stroke();

        // Col 1: Age Group (Gold)
        ctx.textAlign = 'center';
        ctx.fillStyle = goldText;
        ctx.font = isSlateTemplate
          ? '900 42px sans-serif'
          : '900 50px sans-serif';
        ctx.fillText(sqCode, col1CenterX, centerY + 15);

        // Col 2: Kickoff Time + HOME/AWAY (or FT + HOME/AWAY)
        ctx.fillStyle = textPrimary;
        ctx.font = isSlateTemplate
          ? '800 28px sans-serif'
          : '800 32px sans-serif';
        ctx.fillText(isResults ? 'FT' : fix.kickoffTime || 'TBA', col2CenterX, centerY - 2);

        ctx.fillStyle = textMuted;
        ctx.font = '800 18px sans-serif';
        ctx.fillText(fix.isHome ? 'HOME' : 'AWAY', col2CenterX, centerY + 24);

        // Col 3: Home Team   VS / SCORE   Away Team (No club logos!)
        const teamMaxW = (matchAreaRight - matchAreaLeft - 110) / 2;
        const leftTeamCenterX = matchAreaLeft + teamMaxW / 2;
        const rightTeamCenterX = matchAreaRight - teamMaxW / 2;

        // Center VS or Score in Gold
        ctx.textAlign = 'center';
        ctx.fillStyle = goldText;
        ctx.font = isResults
          ? isSlateTemplate
            ? '900 38px sans-serif'
            : '900 48px sans-serif'
          : isSlateTemplate
          ? '900 34px sans-serif'
          : '900 42px sans-serif';
        const centerToken = isResults ? `${homeScore} - ${awayScore}` : 'VS';
        ctx.fillText(centerToken, matchCenterX, centerY + 13);

        // Draw team name helper (supports clean 1 or 2 line wrap)
        const drawTeamLabel = (label: string, cx: number) => {
          ctx.textAlign = 'center';
          ctx.fillStyle = textPrimary;
          const baseSize = isSlateTemplate ? 31 : 36;
          ctx.font = `800 ${baseSize}px sans-serif`;
          let lines = wrapText(ctx, label, teamMaxW);
          if (lines.length > 2 || lines.some(l => ctx.measureText(l).width > teamMaxW)) {
            ctx.font = `800 ${baseSize - 6}px sans-serif`;
            lines = wrapText(ctx, label, teamMaxW);
          }
          const clipped = lines.slice(0, 2);
          if (clipped.length === 1) {
            ctx.fillText(clipped[0], cx, centerY + 11);
          } else {
            ctx.fillText(clipped[0], cx, centerY - 6);
            ctx.fillText(clipped[1], cx, centerY + 25);
          }
        };

        drawTeamLabel(homeTeam, leftTeamCenterX);
        drawTeamLabel(awayTeam, rightTeamCenterX);

        currentY += rowHeight + rowGap;

        // Extra match details for single Matchday / Full Time templates
        if (!isSlateTemplate) {
          ctx.textAlign = 'center';
          ctx.fillStyle = textMuted;
          ctx.font = '700 22px sans-serif';
          const venueLine = fix.venue || 'Marlboro Sports Ground, Sandton';
          ctx.fillText(venueLine.slice(0, 62), width / 2, currentY + 26);

          ctx.fillStyle = goldText;
          ctx.font = '700 20px sans-serif';
          ctx.fillText(
            `${fix.competition || 'NRFA Little League'} · ${formatDateMMDDYYYY(fix.date)}`,
            width / 2,
            currentY + 60
          );
          currentY += 100;
        }
      }

      currentY += groupSpacing - rowGap;
    }
  }

  // 5. Clean Bottom Club Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = isLight ? '#64748B' : 'rgba(255,255,255,0.65)';
  ctx.font = '700 20px sans-serif';
  ctx.fillText(
    `MARLBORO GARDENS FOOTBALL CLUB · EST. 1985 · ${options.seasonYear}`,
    width / 2,
    height - 38
  );

  return canvas.toDataURL('image/png');
}

export function downloadDataUrlAsPng(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
