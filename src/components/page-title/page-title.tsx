import "./page-title.scss";
const PageTitle = ({contentRows = [""], className = ""}: {contentRows?: any[]; className?: string}) => {
  return (
    <div className={`page-title-section ${className}`}>
      <div>
        {contentRows.map((row: string, index: number) => {
          return <h1 key={`title-row-${index}`}>{row}</h1>;
        })}
      </div>
    </div>
  );
};

export default PageTitle;
