// Style the infobox
const frame = viewer.infoBox.frame;
frame.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms';
frame.addEventListener(
    'load',
    function() {
        const simplebarLink = frame.contentDocument.createElement('script');
        simplebarLink.src = Cesium.buildModuleUrl('../../../simplebar/dist/simplebar.js');
        viewer.infoBox.frame.contentDocument.head.appendChild(simplebarLink);

        const simplebarCssLink = frame.contentDocument.createElement('link');
        simplebarCssLink.href = Cesium.buildModuleUrl('../../../simplebar/dist/simplebar.css');
        simplebarCssLink.rel = 'stylesheet';
        simplebarCssLink.type = 'text/css';
        viewer.infoBox.frame.contentDocument.head.appendChild(simplebarCssLink);

        const cssLink = frame.contentDocument.createElement('link');
        cssLink.href = Cesium.buildModuleUrl('../../../../src/app/components/infobox.css');
        cssLink.rel = 'stylesheet';
        cssLink.type = 'text/css';
        viewer.infoBox.frame.contentDocument.head.appendChild(cssLink);
    },
    false
);

const loadingDescription = `
<div class="loading">
<svg width="100px" height="100px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-rolling" style="animation-play-state: running; animation-delay: 0s; background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%;">
<circle cx="50" cy="50" fill="none" ng-attr-stroke="{{config.color}}" ng-attr-stroke-width="{{config.width}}" ng-attr-r="{{config.radius}}" ng-attr-stroke-dasharray="{{config.dasharray}}" stroke="#4488bb" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138" style="animation-play-state: running; animation-delay: 0s;">
  <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1.7s" begin="0s" repeatCount="indefinite" style="animation-play-state: running; animation-delay: 0s;"></animateTransform>
</circle>
</svg>
Evaluating Query..
</div>
`;
