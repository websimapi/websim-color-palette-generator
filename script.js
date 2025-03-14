import ColorThief from 'color-thief';

// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const previewContainer = document.querySelector('.preview-container');
const generateBtn = document.getElementById('generateBtn');
const paletteContainer = document.querySelector('.palette-container');
const paletteColors = document.getElementById('paletteColors');
const regenerateBtn = document.getElementById('regenerateBtn');
const newImageBtn = document.getElementById('newImageBtn');
const copyPaletteBtn = document.getElementById('copyPaletteBtn');

// Initialize ColorThief
const colorThief = new ColorThief();

// Number of colors to extract
let colorCount = 6;
let currentImage = null;

// Event Listeners
imageUpload.addEventListener('change', handleImageUpload);
generateBtn.addEventListener('click', generatePalette);
regenerateBtn.addEventListener('click', regeneratePalette);
newImageBtn.addEventListener('click', resetGenerator);
copyPaletteBtn.addEventListener('click', copyAllColors);

/**
 * Handle image upload
 */
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        imagePreview.src = event.target.result;
        currentImage = event.target.result;
        
        // Show preview and generate button
        previewContainer.classList.remove('hidden');
        paletteContainer.classList.add('hidden');
        
        // Ensure image is loaded before allowing palette generation
        imagePreview.onload = function() {
            generateBtn.disabled = false;
        };
    };
    
    reader.readAsDataURL(file);
}

/**
 * Generate color palette from the uploaded image
 */
function generatePalette() {
    if (!imagePreview.complete) {
        alert('Please wait for the image to load completely.');
        return;
    }
    
    try {
        const palette = colorThief.getPalette(imagePreview, colorCount);
        displayPalette(palette);
        paletteContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Error generating palette:', error);
        alert('Error generating palette. Please try another image.');
    }
}

/**
 * Regenerate palette with different color count
 */
function regeneratePalette() {
    // Alternate between different numbers of colors
    colorCount = colorCount === 6 ? 8 : (colorCount === 8 ? 5 : 6);
    generatePalette();
}

/**
 * Display the generated color palette
 */
function displayPalette(palette) {
    paletteColors.innerHTML = '';
    
    palette.forEach(color => {
        const [r, g, b] = color;
        const hexColor = rgbToHex(r, g, b);
        
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        
        // Choose text color based on background brightness
        const textColor = isLightColor(r, g, b) ? '#000' : '#fff';
        
        colorBox.innerHTML = `
            <span class="color-value" style="color: ${textColor}">${hexColor}</span>
            <div class="color-copied">Copied!</div>
        `;
        
        // Add click event to copy the color
        colorBox.addEventListener('click', () => {
            copyToClipboard(hexColor, colorBox);
        });
        
        paletteColors.appendChild(colorBox);
    });
}

/**
 * Reset the generator to upload a new image
 */
function resetGenerator() {
    imageUpload.value = '';
    previewContainer.classList.add('hidden');
    paletteContainer.classList.add('hidden');
    currentImage = null;
}

/**
 * Copy a color to clipboard
 */
function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        const copiedMessage = element.querySelector('.color-copied');
        copiedMessage.classList.add('show-copied');
        
        setTimeout(() => {
            copiedMessage.classList.remove('show-copied');
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

/**
 * Copy all colors to clipboard
 */
function copyAllColors() {
    const colorElements = document.querySelectorAll('.color-box');
    const colorValues = Array.from(colorElements).map(el => 
        el.querySelector('.color-value').textContent
    );
    
    const colorText = colorValues.join(', ');
    
    navigator.clipboard.writeText(colorText).then(() => {
        alert('All colors copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

/**
 * Convert RGB to HEX
 */
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Check if a color is light or dark
 */
function isLightColor(r, g, b) {
    // Formula to determine perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
}