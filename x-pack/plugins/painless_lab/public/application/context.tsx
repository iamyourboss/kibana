/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { createContext, ReactNode, useState, useContext } from 'react';
import { HttpSetup } from 'src/core/public';

import { Links } from '../links';

import { initialState, Store } from './store';
import { PAINLESS_LAB_KEY } from './constants';

interface ContextValue {
  state: Store;
  updateState: (nextState: (s: Store) => Partial<Store>) => void;
  services: {
    http: HttpSetup;
  };
  links: Links;
}

const AppContext = createContext<ContextValue>(undefined as any);

interface AppContextProviderArgs {
  children: ReactNode;
  value: {
    http: HttpSetup;
    links: Links;
  };
}

export const AppContextProvider = ({
  children,
  value: { http, links },
}: AppContextProviderArgs) => {
  const [state, setState] = useState<Store>(() => ({
    ...initialState,
    ...JSON.parse(localStorage.getItem(PAINLESS_LAB_KEY) || '{}'),
  }));

  const updateState = (getNextState: (s: Store) => Partial<Store>): void => {
    const update = getNextState(state);
    const nextState = {
      ...state,
      ...update,
    };
    localStorage.setItem(PAINLESS_LAB_KEY, JSON.stringify(nextState));
    setState(() => nextState);
  };

  return (
    <AppContext.Provider value={{ updateState, state, services: { http }, links }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('AppContext can only be used inside of AppContextProvider!');
  }
  return ctx;
};
