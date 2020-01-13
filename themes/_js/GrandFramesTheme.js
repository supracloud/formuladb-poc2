var GrandFramesTheme = {
    '.frmdb-t-main-nav': {
        addClasses: [
            'fixed-top', 'row', 'frmdb-bg-dark-30', 'shadow', 'py-4', 'border-bottom', 'border-bottom-2', 'border-primary', 'justify-content-center',
        ],
    },
    '.frmdb-t-main-nav .navbar': {
        addClasses: [
            'navbar-dark', 'navbar-expand-lg', 'col-12', 'col-lg-8',
        ],
    },
    '.frmdb-t-cover': {
        addClasses: [
            'frmdb-transform-preserve-3d',
        ],
        children: {
            '.frmdb-t-cover__main': {
                addCssVars: {
                    '--frmdb-bg-img': "url('../_img/bg2.jpg')",
                },
                addClasses: [
                    'min-vh-100', 'd-flex', 'align-items-center', 'justify-content-center',
                    'frmdb-bg-zoom-in', 'overflow-hidden',
                    'px-md-0', 'px-3',
                ],
                children: {
                    '.jumbotron': {
                        addClasses: ['col-12', 'col-lg-8'],
                    }
                }
            },
            '.frmdb-t-cover__section': {
                addClasses: [
                    'container', 'p-0', 'frmdb-section-dark', 'mt-n5',
                ],
                children: {
                    '> *': {
                        addClasses: ['m-3', 'border', 'border-2', 'border-primary', ]
                    }
                }
            },
        }
    },
    '.jumbotron': {
        addClasses: [
            'min-vh-50',
            'text-light', 'frmdb-bg-dark-40',
            'm-3', 'p-3', 
            'border', 'border-2', 'border-primary', 
            'text-center',
            'd-flex', 'flex-column', 'justify-content-around'
        ],
    },
    '.card-deck': {
        addClasses: ['frmdb-card-h-50'],
    },
    '.frmdb-t-card-img': {
        addClasses: ['border-0'],
        addStyles: {
            'display': 'grid',
        },
        children: {
            '.frmdb-t-img': {
                addStyles: {
                    'grid-row': '1 / 1',
                    'grid-column': '1 / 1',
                }
            },
            '.card-body': {
                addClasses: [
                    'text-center', 'border', 'border-2', 'border-primary', 'm-3',
                    'frmdb-bg-dark-40', 'text-light',
                ],
                addStyles: {
                    'grid-row': '1 / 1',
                    'grid-column': '1 / 1',
                    'align-self': 'end',
                    'justify-self': 'center',
                },
            },
            '.frmdb-t-card-note': {
                addClasses: [
                    'text-center', 'border', 'border-2', 'border-primary', 'p-1',
                    'bg-dark', 'text-light', 'mt-n3'
                ],
                addStyles: {
                    'grid-row': '1 / 1',
                    'grid-column': '1 / 1',
                    'align-self': 'start',
                    'justify-self': 'center',
                },
            },
            '.frmdb-t-card-action': {
                addClasses: ['mt-n4', 'text-center']
            },
            '.frmdb-t-card-action a': {
                addClasses: ['btn', 'btn-primary', 'btn-lg'],
            },
        },
    },
    '.frmdb-t-card-icon': {
        addClasses: [
            'border', 'border-2', 'border-primary', 'p-3',
            'frmdb-bg-dark-70'
        ],
        children: {
            'i': {
                addClasses: ['text-primary', 'm-2'],
                addStyles: {'font-size': '50px'},
            }
        }
    }
};
