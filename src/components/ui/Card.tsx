import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

type CardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

type CardBodyProps = {
  children: React.ReactNode;
  className?: string;
};

type CardFooterProps = {
  children: React.ReactNode;
  className?: string;
};

const Card = ({
  children,
  className = ''
}: CardProps) => {
  return <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {children}
    </div>;
};

const CardHeader = ({
  children,
  className = ''
}: CardHeaderProps) => {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>;
};

const CardBody = ({
  children,
  className = ''
}: CardBodyProps) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

const CardFooter = ({
  children,
  className = ''
}: CardFooterProps) => {
  return <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>;
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

