import { openmrsFetch, FetchResponse } from '@openmrs/esm-framework';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

interface FlagFetchResponse {
  uuid: string;
  message: string;
  voided: boolean;
  flag: { uuid: string; display: string };
  patient: { uuid: string; display: string };
  tags: Array<{ uuid: string; display: string }>;
  auditInfo: { dateCreated: string };
}

interface FlagsFetchResponse {
  results: Array<FlagFetchResponse>;
}

/**
 * React hook that takes in a patient uuid and returns
 * patient flags for that patient together with helper objects
 * @param patientUuid Unique patient idenfier
 * @returns An array of patient identifiers
 */
export function useFlagsFromPatient(patientUuid: string) {
  const { data, error, isValidating, mutate } = useSWR<FetchResponse<FlagsFetchResponse>, Error>(
    `/ws/rest/v1/patientflags/patientflag?patient=${patientUuid}&v=full`,
    openmrsFetch,
  );
  const result = {
    flags: data?.data?.results ?? [],
    flagLoadingError: error,
    isLoadingFlags: !data && !error,
    isValidatingFlags: isValidating,
    mutate,
  };
  return result;
}

export function useCurrentPath(): string {
  const [path, setPath] = useState(window.location.pathname);

  const listenToRoutingEvent = useCallback(
    (e) => {
      const winPath = e.detail.newUrl;
      setPath(winPath);
    },
    [setPath],
  );

  useEffect(() => {
    window.addEventListener('single-spa:routing-event', listenToRoutingEvent);
    return () => {
      window.removeEventListener('single-spa:routing-event', listenToRoutingEvent);
    };
  }, [listenToRoutingEvent]);

  return path;
}

export function enablePatientFlag(flagUuid: string) {
  const controller = new AbortController();
  const url = `/ws/rest/v1/patientflags/patientflag/${flagUuid}`;

  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: { deleted: 'false' },
    signal: controller.signal,
  });
}

export function disablePatientFlag(flagUuid: string) {
  const controller = new AbortController();
  const url = `/ws/rest/v1/patientflags/patientflag/${flagUuid}`;

  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
    signal: controller.signal,
  });
}