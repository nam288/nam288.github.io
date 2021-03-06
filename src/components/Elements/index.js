import React, { Fragment } from "react";
import { ImagesContext } from "./../Article";
import { Link } from "react-router-dom";
import Tooltip from "./../Tooltip";
import { v4 as uuidv4 } from "uuid";
import Prism from "prismjs";
import "./style.sass";

export const Text = ({ text }) => <span>{text.replace("\n\n", "\n")}</span>;

const Heading = ({ className, id, text, level, indices }) => {
  const heading = React.useRef();

  if (1 === level) {
    let indexLevel = "" + indices[0];
    if (indexLevel < 10) indexLevel = "0" + indexLevel;
    let tensIndexLevel = indexLevel[0],
      onesIndexLvel = indexLevel[1];
    return (
      <div ref={heading} className={className} id={id}>
        <div className="heading__index heading__tens">{tensIndexLevel}</div>
        <div className="heading__index heading__ones">{onesIndexLvel}</div>
        <div className="heading__text" level={indexLevel}>
          {text}
        </div>
      </div>
    );
  }

  return (
    <div ref={heading} className={className} id={id}>
      {text}
    </div>
  );
};

const WikiLink = ({ url, displayText }) => (
  <Tooltip url={url}>
    <Link
      to={"/" + url}
      onClick={() => {
        document.body.scrollTop = 0;
      }}
    >
      {displayText.map(e => (
        <Element key={uuidv4()} props={e} />
      ))}
    </Link>
  </Tooltip>
);

export const Template = ({ props }) => {
  if (props.type == "N/A" || props.type == "Infobox") return "";

  let { attribute } = props;
  if (props.type == "multipleImages") {
    return (
      <div className="wiki-gallery">
        {props.images &&
          props.images.map(e => {
            return <Element key={uuidv4()} props={e} />;
          })}
      </div>
    );
  }

  if (props.type == "cite")
    return (
      <Fragment>
        <a className="wiki-cite" href={attribute.url}>
          {`"${attribute.title}"`}
        </a>
        {". "}
        {props.subType == "web" && attribute.publisher && (
          <span>{`${attribute.publisher}. `}</span>
        )}
        {props.subType == "web" && attribute.accessdate && (
          <span>{`Retrieved ${attribute.accessdate}. `}</span>
        )}
      </Fragment>
    );

  if (props.type == "footnote") {
    return "";
    // return (
    //   <sup className="wiki-footnote">
    //     {props?.children?.map(e => (
    //       <Element key={uuidv4()} props={e} />
    //     ))}
    //   </sup>
    // );
  }

  return "<--N/A" + JSON.stringify(props) + "-->";
};

const Image = ({ id, src, float, caption }) => {
  return (
    <Fragment>
      <div className={`wiki-img__container ${float}`}>
        <img id={id} className="lazyload wiki-img__image" data-src={src} />
        <div className="wiki-img__caption">
          {caption?.map(e => <Element key={uuidv4()} props={e} />) || ""}
        </div>
      </div>
    </Fragment>
  );
};

const HightLight = ({ code, language }) => {
  return (
    <pre lang={language.toUpperCase()}>
      <code
        className={language ? `language-${language}` : ""}
        dangerouslySetInnerHTML={{
          __html: Prism.highlight(
            code.trim(),
            Prism.languages[language] || Prism.languages.js,
            language
          )
        }}
      ></code>
    </pre>
  );
};

export const Element = ({ props }) => {
  if (props === null) throw new Error("Create element withou props");
  let { elementName, children } = props;

  if (elementName == "Comment") return "";

  if (elementName == "ExternalLink") {
    return (
      <a href={"https://en.wikipedia.org/wiki/" + props.url}>
        {props.displayText}
      </a>
    );
  }

  if (elementName == "Break") {
    return <br />;
  }

  if (elementName == "Text") {
    return <Text text={props.text} />;
  }

  if (elementName == "Template") {
    return <Template {...{ props }} />;
  }

  let renderChildren;
  if (Array.isArray(children)) {
    renderChildren = children.map(e => <Element key={uuidv4()} props={e} />);
  }

  if (elementName == "Code") {
    return <code className="wiki-code">{renderChildren}</code>;
  }

  if (elementName == "HightLight") {
    // console.count();

    return <HightLight code={props.code} language={props.language} />;

    // return (
    //   <PrismCode
    //     code={props.code}
    //     language={props.language}
    //     plugins={["line-numbers"]}
    //   />
    // );
  }

  if (elementName == "Bold") {
    return <span className="wiki-bold">{renderChildren}</span>;
  }

  if (elementName == "Italic") {
    return <span className="wiki-italic">{renderChildren}</span>;
  }

  if (elementName == "BoldItalic") {
    return <span className="wiki-italic wiki-bold">{renderChildren}</span>;
  }

  if (elementName == "Block Quote") {
    return <blockquote>{renderChildren}</blockquote>;
  }

  if (elementName.slice(0, -1) == "Heading") {
    return <Heading {...props} />;
  }

  if (elementName == "Gallery") {
    return (
      <div className="wiki-gallery">
        {props.images.map(e => {
          return <Element key={uuidv4()} props={e} />;
        })}
      </div>
    );
  }

  if (elementName == "Link") {
    let type = props.type;
    if (type == "wikiLink") {
      return <WikiLink url={props.url} displayText={props.displayText} />;
    }
    if (type == "media") {
      const valueImages = React.useContext(ImagesContext);

      if (props?.url && valueImages?.images?.[props.url]) {
        let float =
          !props.multipleImage && props?.options?.indexOf("left") > -1
            ? "fl-left"
            : "fl-right";
        return (
          <Image
            id={props.url}
            src={valueImages.images[props.url].url}
            float={float}
            caption={props.caption}
          />
        );
      }
    }
  } else if (elementName == "Reference") {
    if (props && props.children?.[0]?.attribute?.url) {
      return (
        <sup>
          <a href={props.children[0].attribute.url}>{props.referenceIndex}</a>
        </sup>
      );
    }
    return (
      <sup>
        <a href={props}>{props.referenceIndex}</a>
      </sup>
    );
  }

  return "";
};
