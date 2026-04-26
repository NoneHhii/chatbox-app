// import { formatDistanceToNow } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const displayTime = (time) => {
    return formatDistanceToNow(new Date(time), {
        addSuffix: true,
        locale: vi
    });
};