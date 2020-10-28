
<script>
  function initMap() {
    const map = L.map('map').setView({{ include.lat-lng | default: "[46.5, 7]" }}, {{ include.zoom | default: "8" }})
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: 'mapbox/streets-v11',
      accessToken: 'pk.eyJ1IjoidGVycmFwZXV0ZXMiLCJhIjoiY2p0N3IxZjRhMDB5bDQ1cW52Z2s2MnVnNCJ9.Ism1OhdYA3qPFom2htkx8w'
    }).addTo(map)

    const marker = L.marker([46.2115, 6.119]).addTo(map)
  }
</script>
<!-- Load Leaflet after css for good size calculation -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.4.0/dist/leaflet.css"
    integrity="sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA=="
    crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"
    integrity="sha512-QVftwZFqvtRNi0ZyCtsznlKSWOStnDORoefr1enyq5mVL4tmKB3S/EnC3rRJcxCPavG10IcrVGSmPh6Qw5lwrg=="
    crossorigin=""></script>
<script>initMap()</script>
