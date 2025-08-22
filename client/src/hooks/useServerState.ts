import { useQuery } from "@tanstack/react-query";
import { StatusCodes } from "http-status-codes";

type BakedResponse = Omit<Response, "status"> & { status: StatusCodes };

interface StateOptions<StateType> {
    queryKey?: string[];
    focusRefetch?: boolean;
    retry?: boolean;
    responseTransform?: (data: string, response: BakedResponse) => StateType;
}

type OptionsOrQueryKey<StateType> = (
    StateOptions<StateType> | string[] | string
);

class QueryError extends Error {
    response: BakedResponse;

    constructor(response: Response) {
        super();
        this.response = response;
    }
}

function extractOptions<StateType>(
    route: string,
    optionsOrQueryKey?: OptionsOrQueryKey<StateType>
) {
    if (typeof optionsOrQueryKey == "string")
        return { queryKey: [optionsOrQueryKey], options: {} };

    if (Array.isArray(optionsOrQueryKey))
        return { queryKey: optionsOrQueryKey, options: {} };

    if (optionsOrQueryKey)
        return {
            queryKey: optionsOrQueryKey.queryKey || [route],
            options: optionsOrQueryKey
        };

    return { queryKey: [route], options: {} };
}

export function useServerState<StateType>(
    route: string,
    optionsOrQueryKey?: OptionsOrQueryKey<StateType>
) {
    const { queryKey, options } = extractOptions(route, optionsOrQueryKey);

    const query = useQuery<StateType, QueryError>({
        queryKey: queryKey,
        queryFn: async () => {
            const response = await fetch(route);

            if (!response.ok) throw new QueryError(response);

            const responseText = await response.text();

            return (options?.responseTransform
                ? options.responseTransform(responseText, response)
                : JSON.parse(responseText)
            ) as StateType;
        },
        refetchOnWindowFocus: options?.focusRefetch || false,
        retry: options?.retry
    });

    if (query.status == "success") return query;

    return query;
}