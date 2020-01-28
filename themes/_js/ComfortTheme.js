var ComfortTheme = {
    '.frmdb-t-main-nav': {
        addClasses: [
            'container', 'bg-white', 'fixed-top', 'shadow',
        ],
    },
    '.frmdb-t-main-nav .navbar': {
        addClasses: [
            'navbar-light', 'navbar-expand-lg',
        ],
    },
    '.frmdb-t-cover': {
        addClasses: [
            'min-vh-100', 'overflow-hidden', 'd-flex', 'flex-column', 'justify-content-between',
            'frmdb-bg-tint-parallax', 'frmdb-bg-tint-secondary-50',
        ],
        addCssVars: {
            '--frmdb-bg-img': "url('../_img/bg1.jpg')",
        },
        children: {
            '.frmdb-t-main': {
                addClasses: [
                    'flex-grow-1', 'd-flex', 'flex-column', 'justify-content-center'
                ],
            },
            '.frmdb-t-aside': {
                addClasses: [
                    'container', 'frmdb-section-dark'
                ],
                children: {
                    '*': {
                        addClasses: ['m-3']
                    }
                }
            },            
        }
    },
    '.jumbotron': {
        addClasses: [
            'w-100', 'text-center', 'bg-transparent'
        ],
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
                addClasses: ['text-center']
            },
            '.frmdb-t-card-note': {
                addClasses: ['text-center', 'text-info', 'font-weight-bold'],
            },
            '.frmdb-t-card-action': {
                addStyles: {
                    'grid-row': '1 / 1',
                    'grid-column': '1 / 1',
                    'align-self': 'end',
                    'justify-self': 'center',
                },
                addClasses: ['mb-2']
            },
            '.frmdb-t-card-action a': {
                addClasses: ['btn', 'btn-primary', 'm-auto'],
            },
        },
    },
    '.frmdb-t-card-icon': {
        addClasses: ['border-light', 'p-4', 'bg-transparent'],
    }
};
