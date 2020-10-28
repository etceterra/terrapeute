function buildMap(selector, viewbox) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = "https://unpkg.com/leaflet@1.4.0/dist/leaflet.css"
  const script = document.createElement('script')
  script.src = "https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"
  document.head.appendChild(link)
  document.head.appendChild(script)
  const map = L.map(selector).setView(viewbox[0], viewbox[1])
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoidGVycmFwZXV0ZXMiLCJhIjoiY2p0N3IxZjRhMDB5bDQ1cW52Z2s2MnVnNCJ9.Ism1OhdYA3qPFom2htkx8w'
  }).addTo(map)
  return map
}
