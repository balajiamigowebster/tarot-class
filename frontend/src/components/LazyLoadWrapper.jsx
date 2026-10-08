import ReactLazyLoad from 'react-lazyload';

// Handle ES module interop for older CommonJS packages in Vite
const LazyLoad = ReactLazyLoad.default || ReactLazyLoad;

export default LazyLoad;
