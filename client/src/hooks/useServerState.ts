import { useQuery } from "@tanstack/react-query";
import { StatusCodes } from "http-status-codes";

class QueryError extends Error {
    response: BakedResponse;

    constructor(response: Response) {
        super();
        this.response = response;
    }
}

type BakedResponse = Omit<Response, "status"> & { status: StatusCodes };

interface StateOptions<StateType> {
    queryKey?: (string | undefined)[];
    focusRefetch?: boolean;
    retry?: boolean;
    responseTransform?: (data: string, response: BakedResponse) => StateType;
    enabled?: boolean;
}

interface ExtractedOptions<StateType> {
    queryKey: string[];
    options: StateOptions<StateType>
}

type OptionsOrQueryKey<StateType> = (
    StateOptions<StateType>
    | StateOptions<StateType>["queryKey"]
    | string
);

function extractOptions<StateType>(
    route: string,
    optionsOrQueryKey?: OptionsOrQueryKey<StateType>
): ExtractedOptions<StateType> {
    if (typeof optionsOrQueryKey == "string")
        return { queryKey: [optionsOrQueryKey], options: {} };

    if (Array.isArray(optionsOrQueryKey))
        return {
            queryKey: optionsOrQueryKey.map(key => key || ""),
            options: {}
        };

    if (optionsOrQueryKey)
        return {
            queryKey: optionsOrQueryKey.queryKey?.map(key => key || "")
                || [route],
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
        retry: options?.retry,
        enabled: options?.enabled
    });

    if (query.status == "success") return query;

    return query;
}