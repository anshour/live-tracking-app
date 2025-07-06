interface TrackerMarkerIconProps {
  name: string;
}

export const TrackerMarkerIcon = ({ name }: TrackerMarkerIconProps) => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="134" height="56" viewBox="0 0 134 56" fill="none">
      <rect x="38" y="1" width="95" height="31" fill="white" stroke="black" stroke-width="2"/>
      <rect width="33" height="33" transform="matrix(-1 0 0 1 33 0)" fill="black"/>
      <path d="M24 26.3333C24 24.4768 23.2625 22.6964 21.9497 21.3836C20.637 20.0708 18.8565 19.3333 17 19.3333C15.1435 19.3333 13.363 20.0708 12.0503 21.3836C10.7375 22.6964 10 24.4768 10 26.3333" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16.9999 19.3333C19.5772 19.3333 21.6666 17.244 21.6666 14.6667C21.6666 12.0893 19.5772 10 16.9999 10C14.4226 10 12.3333 12.0893 12.3333 14.6667C12.3333 17.244 14.4226 19.3333 16.9999 19.3333Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16.9999 28.6667C23.4432 28.6667 28.6666 23.4433 28.6666 17C28.6666 10.5567 23.4432 5.33334 16.9999 5.33334C10.5566 5.33334 5.33325 10.5567 5.33325 17C5.33325 23.4433 10.5566 28.6667 16.9999 28.6667Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.46006 35.5429L25.4484 35.5857L15.9913 51.9659L6.46006 35.5429Z" fill="black"/>
      <text x="85" y="18" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="black" text-anchor="middle" dominant-baseline="middle">${name}</text>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
    scaledSize: new google.maps.Size(130, 50),
    anchor: new google.maps.Point(20, 43),
  };
};
