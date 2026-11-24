import { QuartzComponent } from '@quartz-community/types';
export { QuartzComponent, QuartzComponentProps, StringResource } from '@quartz-community/types';

interface BreadcrumbOptions {
    /** Symbol between crumbs */
    spacerSymbol: string;
    /** Name of first crumb */
    rootName: string;
    /** Whether to look up frontmatter title for folders */
    resolveFrontmatterTitle: boolean;
    /** Whether to display the current page in the breadcrumbs */
    showCurrentPage: boolean;
    /** Shorten parent folder crumbs to their initial when this many parent folders are shown */
    shortenParentFoldersAt: number;
}
declare const _default: (opts?: Partial<BreadcrumbOptions>) => QuartzComponent;

export { type BreadcrumbOptions, _default as Breadcrumbs };
