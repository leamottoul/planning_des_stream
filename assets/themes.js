const themes = {
  dark: {
    name: 'Sombre',
    dark: true,

    needMagicWord: false,

    bgRotate: 0,
    bgInvert: false,

    colors:{
      'primary': '#9244FF',
      'surface': '#0f0e22',
      'on-background': '#FFFFFF',
      'on-surface': '#FFFFFF',
    }
  },

  light: {
    name: 'Clair',
    dark: false,

    needMagicWord: false,

    bgRotate: 230,
    bgInvert: true,

    colors:{
      'primary': '#e66767',
      'surface': '#ffd8fc',
      'on-background': '#0f0705',
      'on-surface': '#0f0705',
    }
  },

  magic: {
    name: 'Magic',
    dark: true,

    needMagicWord: true,

    bgRotate: 280,
    bgInvert: false,

    colors:{
      'primary': '#2bbc9a',
      'surface': '#aff7db',
      'on-background': '#FFFFFF',
      'on-surface': '#003328',
    }
  },
}