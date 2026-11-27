import Image from "next/image";
import type { ProductArt as Illustration, ProductImage } from "@/commerce/types";
import styles from "./ProductArt.module.css";

export function ProductArt({ image }: { image: ProductImage }) {
  return (
    <div className={styles.frame}>
      {image.src !== undefined ? (
        <Image src={image.src} alt={image.alt} fill unoptimized className={styles.photo} />
      ) : (
        <svg viewBox="0 0 160 160" role="img" aria-label={image.alt} className={styles.illustration}>
          <path d="M16 130h128" stroke="var(--sb-sand-dark)" strokeWidth="2" />
          <g fill={image.art.color} stroke="var(--sb-navy-dark)" strokeWidth="3" strokeLinejoin="round">
            <ProductShape {...image.art} />
          </g>
        </svg>
      )}
    </div>
  );
}

function ProductShape({ kind, accent }: Illustration) {
  switch (kind) {
    case "board":
      return <>
        <path d="M80 12C63 21 56 51 57 78c1 22 7 41 14 50h18c7-9 13-28 14-50 1-27-6-57-23-66Z" />
        <path d="M58 67h44v14H58z" fill={accent} />
        <path d="M80 17v45m0 23v39" stroke={accent} strokeWidth="2" />
      </>;
    case "tee":
      return <>
        <path d="m54 34 13-6c3 9 23 9 26 0l13 6 24 22-17 20-12-9v51H59V67l-12 9-17-20Z" />
        <path d="M70 64h20v11H70z" fill={accent} />
      </>;
    case "hoodie":
      return <>
        <path d="m60 48 5-23 15-9 15 9 5 23 19 17 10 50-17 4-11-39v45H59V80l-11 39-17-4 10-50Z" />
        <path d="m65 45 15-15 15 15-15 11Zm5 50h20l6 13H64Z" fill={accent} />
      </>;
    case "shorts":
      return <>
        <path d="M43 48h74l12 62-36 5-13-31-13 31-36-5Z" />
        <path d="M43 48h74l2 13H41Z" fill={accent} />
        <path d="m78 60-6 10m9-10 6 10M45 99l21 3m28 0 21-3" fill="none" stroke={accent} />
      </>;
    case "swim":
      return <>
        <path d="m51 28 12 1c3 24 31 24 34 0l12-1c-5 19-4 39 5 66-9 5-18 18-24 28H70c-6-10-15-23-24-28 9-27 10-47 5-66Z" />
        <path d="M54 67h52l3 11H51Z" fill={accent} />
      </>;
    case "fins":
      return <>
        <path d="M28 109c11-23 16-47 44-56-9 17-12 37-4 56Zm56 0c11-27 15-54 46-67-9 21-15 45-5 67Z" />
        <path d="M28 109h40v9H28zm56 0h41v9H84z" fill={accent} />
      </>;
    case "leash":
      return <>
        <path d="M57 47c-42 10-38 70 3 70 36 0 40-54 6-54-27 0-29 39-4 39 15 0 20-21 8-24" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <path d="M99 64c5-8 10-12 17-11" fill="none" stroke={accent} strokeWidth="6" />
        <rect x="50" y="26" width="49" height="25" rx="5" />
        <path d="M99 58h25v31H99z" />
        <path d="M59 39h31m18 28h7v13h-7z" stroke={accent} fill={accent} />
      </>;
    case "pad":
      return <>
        <path d="m40 46 22-10v83l-18-7-7-13Zm31-12h18v87H71Zm27 2 22 10 3 53-7 13-18 7Z" />
        <path d="m46 59 8-4m-8 19 8-4m-8 19 8-4m22-31h8m-8 15h8m-8 15h8m-8 15h8m22-44 8 4m-8 11 8 4m-8 11 8 4" stroke={accent} />
      </>;
    case "bag":
      return <>
        <path d="M80 13c-15 0-26 32-26 61s7 54 26 54 26-25 26-54-11-61-26-61Z" />
        <path d="M80 20c-12 0-20 30-20 54s5 45 20 47" fill="none" stroke={accent} strokeWidth="2" />
        <path d="M103 60h9v25h-9zM58 82h44l-2 11H60Z" fill={accent} />
      </>;
    case "wax":
      return <>
        <rect x="60" y="39" width="68" height="43" rx="5" />
        <rect x="45" y="55" width="68" height="43" rx="5" />
        <rect x="30" y="72" width="68" height="43" rx="5" />
        <path d="M30 88h68v14H30z" fill={accent} />
      </>;
    case "wetsuit":
      return <>
        <path d="m58 32 11-4 11 6 11-6 11 4 24 22-14 17-10-7 10 53-25 5-7-26-7 26-25-5 10-53-10 7-14-17Z" />
        <path d="m57 41 14 10h18l14-10 8 8-19 13H68L49 49Z" fill={accent} />
        <path d="M80 68v18" stroke={accent} />
      </>;
    case "cap":
      return <>
        <path d="M28 91c0-25 12-46 42-46 26 0 41 16 45 46l-17 9H43Z" />
        <path d="M64 46c17 1 27 19 28 45" fill="none" stroke={accent} strokeWidth="2" />
        <path d="M94 64l12 12m-10-2 13 13m-10-2 9 9" stroke={accent} strokeWidth="2" />
        <path d="M55 96c17-7 37-11 57-8l22 13c6 4-4 12-21 12-22 0-41-8-58-17Z" />
        <path d="M44 76h5v-6h5v-4h11v4h4v5h-5v-4h-6v5h4v4h11v4H57v-4h-4v-4h-4v8h-5Z" fill={accent} stroke="none" />
      </>;
    case "shades":
      return <>
        <path d="m27 65 22-20 19 4m65 16-22-20-19 4" fill="none" strokeWidth="5" strokeLinecap="round" />
        <path d="M23 62c17-8 41-7 54 2h6c13-9 37-10 54-2l-4 15-5 1c-4 19-10 29-23 29-14 0-21-10-24-31h-2c-3 21-10 31-24 31-13 0-19-10-23-29l-5-1Z" />
        <path d="M36 68c12-4 25-4 35 1-2 18-7 28-16 28s-16-9-19-29Zm53 1c10-5 23-5 35-1-3 20-10 29-19 29s-14-10-16-28Z" fill={accent} />
        <path d="m44 83 13-14m39 14 13-14" stroke="var(--sb-cream)" strokeWidth="2" />
      </>;
    case "backpack":
      return <>
        <path d="M62 39v-8c0-10 36-10 36 0v8h-8v-6c0-4-20-4-20 0v6Z" fill={accent} />
        <path d="M49 49h62l10 58-8 13H47l-8-13Z" />
        <path d="M47 107V60c0-17 14-26 33-26s33 9 33 26v47c0 9-6 15-14 15H61c-8 0-14-6-14-15Z" />
        <path d="M58 67v-7c0-10 11-16 22-16s22 6 22 16v7" fill="none" stroke={accent} strokeWidth="2" />
        <rect x="59" y="80" width="42" height="29" rx="5" />
        <path d="M63 87h34m-8 0v6M78 58h4v9h-4Z" stroke={accent} />
      </>;
    case "towel":
      return <>
        <path d="M44 25h64l12 87H55Z" />
        <path d="M44 25v85l11 10 11-8-8-87Z" />
        <path d="M45 34h64l1 8H45zm0 16h66l1 8H45zm0 39h72l1 8H45z" fill={accent} stroke="none" />
        <path d="M58 25l8 87-11 8m19-8v6m8-6v7m8-7v6m8-6v7m8-7v6m8-6v7" fill="none" />
        <path d="M77 70h24" stroke={accent} strokeWidth="2" />
      </>;
    case "bottle":
      return <>
        <path d="M73 28v-9c0-12 25-12 25 0v10h-7V19c0-4-11-4-11 0v9Z" fill={accent} />
        <rect x="65" y="26" width="30" height="16" rx="3" fill={accent} />
        <path d="M68 42h24v7l10 12v55c0 7-4 11-11 11H69c-7 0-11-4-11-11V61l10-12Z" />
        <path d="M58 108h44v8c0 7-4 11-11 11H69c-7 0-11-4-11-11Z" fill={accent} />
        <path d="M65 64v35m7-66h16" stroke={accent} strokeWidth="2" />
        <path d="M73 84h4v-5h9v4h-5v4h5v4h8v4H82v-4h-5v4h-4Z" fill={accent} stroke="none" />
      </>;
    case "stickers":
      return <>
        <path d="M56 28h66v76H56Z" fill={accent} />
        <path d="M35 41h66v73H35Z" />
        <path d="M43 98h7l12-18h13l9 18h8v8H43Z" fill="var(--sb-sky)" />
        <path d="M49 67h8v-8h8v-6h15v5h7v9h-6v-7H71v6h-5v5h4v4h14v7H66v-4h-7v-6h-3v10h-7Z" fill="var(--sb-navy)" stroke="none" />
        <path d="M96 91h7V79h20v12h8v25H96Z" />
        <path d="m98 93 14-15 16 15Zm5 7h18v9h-18Z" fill={accent} />
      </>;
    case "kit":
      return <>
        <path d="M30 62h78v58H30Z" />
        <path d="M26 49h86v15H26Z" />
        <path d="M38 78h62v28H38Z" fill={accent} />
        <path d="M46 92h12m6 0h28" stroke="var(--sb-cream)" strokeWidth="3" />
        <path d="M113 72h9v-9h8v9h10v48h-27Z" fill="var(--sb-cream)" />
        <path d="M113 92h27v12h-27Z" fill={accent} />
      </>;
    case "ticket":
      return <>
        <path d="M22 50h116v18a12 12 0 0 0 0 24v18H22V92a12 12 0 0 0 0-24Z" />
        <path d="M102 55v50" stroke={accent} strokeWidth="3" strokeDasharray="5 5" />
        <path d="M62 58c-8 5-11 18-11 22s3 17 11 22c8-5 11-18 11-22s-3-17-11-22Z" fill={accent} />
        <path d="M62 63v34" stroke="var(--sb-navy-dark)" strokeWidth="2" />
        <path d="M112 70h16m-16 10h16m-16 10h10" stroke={accent} strokeWidth="3" />
      </>;
    case "blank":
      return <>
        <path d="M80 14c-18 6-27 30-27 60 0 26 5 44 11 54h32c6-10 11-28 11-54 0-30-9-54-27-60Z" />
        <path d="M62 42c-3 10-4 22-4 34" fill="none" stroke="var(--sb-sand-dark)" strokeWidth="3" />
        <path d="M80 16v111" stroke={accent} strokeWidth="4" />
      </>;
    case "sock":
      return <>
        <path d="M80 20c-14 8-21 32-21 58 0 22 5 39 11 50h20c6-11 11-28 11-50 0-26-7-50-21-58Z" />
        <path d="M63 48h34M60 62h40M59 76h42M60 90h40M62 104h36M66 118h28" fill="none" stroke={accent} strokeWidth="2" />
        <path d="M80 20c-4 3-7 0-10-7m10 7c4 3 7 0 10-7" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      </>;
    case "plugs":
      return <>
        <rect x="28" y="30" width="104" height="92" rx="6" />
        <path d="M30 46h100" stroke={accent} strokeWidth="3" />
        <path d="M44 60h16v34H44Zm28 0h16v34H72Zm28 0h16v34h-16Z" fill={accent} />
        <path d="M48 68h8m-8 8h8m20-8h8m-8 8h8m20-8h8m-8 8h8" stroke="var(--sb-navy-dark)" strokeWidth="2" />
        <path d="M52 104h56v8H52Z" fill="var(--sb-cream)" />
      </>;
  }
}
