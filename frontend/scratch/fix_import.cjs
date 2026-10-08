const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function findJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findJsxFiles(filePath, fileList);
    } else if (filePath.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findJsxFiles(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  if (content.includes("import LazyLoad from 'react-lazyload';")) {
    content = content.replace(
      "import LazyLoad from 'react-lazyload';",
      "import _ReactLazyLoad from 'react-lazyload';\nconst LazyLoad = _ReactLazyLoad.default || _ReactLazyLoad;"
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ' + file);
  }
});
