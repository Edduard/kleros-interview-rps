import React, {FC, useState, useEffect} from "react";
import {Route} from "react-router-dom";

export const withAuthGuard = (WrappedComponent: FC) => {
  return (props: any) => {
    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
      const checkApproval = async () => {
        const _isApproved = await window.ethereum._metamask.isApproved();
        setIsApproved(_isApproved);
      };
      if (!isApproved) {
        checkApproval();
      }
    }, [isApproved]);

    return isApproved ? <WrappedComponent {...props} /> : null;
  };
};

const GuardedRoute: FC<{path: string; element: React.ReactElement}> = ({element, ...rest}) => {
  const Guarded = withAuthGuard(() => element);
  return <Route {...rest} element={<Guarded />} />;
};

export default GuardedRoute;
