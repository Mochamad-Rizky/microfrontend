
    export type RemoteKeys = 'repo1/BoxButton' | 'repo1/useCountStore';
    type PackageType<T> = T extends 'repo1/useCountStore' ? typeof import('repo1/useCountStore') :T extends 'repo1/BoxButton' ? typeof import('repo1/BoxButton') :any;