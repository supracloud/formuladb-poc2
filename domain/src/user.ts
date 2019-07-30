
export interface BeUser {
    _id: string;
    password: string;
    role: string;
    code?: string;
}

export interface FeUser {
    _id: string;
    isDeveloper?: boolean;
}

export interface Role {
    _id: string;
    isDeveloper?: boolean;
    permissions: {
        [entityName: string]: "read" | "write" | "create" | "read-owner" | "write-owner" | "read-role" | "write-role";
    }
}
