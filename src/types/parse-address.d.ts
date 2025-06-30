declare module 'parse-address' {
  export function parseLocation(address: string): {
    number?: string;
    prefix?: string;
    street?: string;
    type?: string;
    city?: string;
    state?: string;
    zip?: string;
    sec_unit_type?: string;
    sec_unit_num?: string;
    [key: string]: unknown;
  };
} 