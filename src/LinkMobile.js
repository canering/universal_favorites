import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import PropTypes from "prop-types";
import folder from "./images/folder.png";
import defaultImage from "./images/default.png";
import MobileDrag from "./images/mobile_drag.png";

function FolderSubDrop(props) {
    const [, drop] = useDrop({
        accept:"LINK",
        drop({ id: draggingId }){
            props.dropElement(props.id, draggingId, true);
        },
    });

    return(
        <div ref={drop} className="menu-item-content">
            <img src={folder} alt="folder" className="icon" />
            {props.label}
        </div>
    );
}

FolderSubDrop.propTypes = {
    label:PropTypes.string,
    dropElement:PropTypes.func,
    id:PropTypes.number
};

function LinkMobile(props) {
    const [, drag, preview] = useDrag({
        item: { type: "LINK" },
        begin(){
            props.saveDraggingId(props.id);
            return {type: "LINK", label:props.item.label, link:props.item.link, draggingType:props.item.type, id:props.id};
        },
    });

    const [{isOver}, drop] = useDrop({
        accept:"LINK",
        drop({ id: draggingId }, monitor){
            if(!monitor.didDrop()) {
                props.dropElement(props.id, draggingId, false);
            }
        },
        collect: monitor => ({
            isOver: monitor.isOver({ shallow: true })
        }),
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    });

    const [faviconLoaded, setFaviconLoaded] = useState(false);

    let style = {};
    if(props.item.clicked) {
        style.backgroundColor = "lightgray";
    }
    if(isOver) {
        if(props.id < props.draggingId) {
            style.borderTop ="2px dashed gray";
        }
        else if(props.id > props.draggingId) {
            style.borderBottom = "2px dashed gray";
        }
    }

    let label = props.item.label;
    if(label.length > 32){
        label = label.substring(0, 31);
        label += "...";
    }

    if(props.item.type === "folder"){
        return (
            <div
                ref={node => drop(node)}
                className="menu-item"
                style={style}
                onClick={() => props.openFolder(props.item, props.id)}
            >
                <FolderSubDrop label={label} dropElement={props.dropElement} id={props.id} />
                <img src={MobileDrag} alt="drag section" ref={node => drag(node)} className="icon dragIcon" />
            </div>);
    }

    let url = props.item.link;
    if(!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "http://" + url;
    }

    return(
        <a href={url} target="_blank" rel="noopener noreferrer">
            <div 
                ref={node => drop(node)}
                className="menu-item" 
                style={style}
            >
                <img src={defaultImage} alt="link" className="icon" hidden={faviconLoaded} />
                <img src={"https://www.google.com/s2/favicons?domain=" + props.item.link} alt="link" 
                    className="icon" onLoad={() => setFaviconLoaded(true)} hidden={!faviconLoaded} />
                {label}
                <img src={MobileDrag} alt="drag section" ref={node => drag(node)} className="icon dragIcon" />
            </div>
        </a>);
}

LinkMobile.propTypes = {
    item:PropTypes.object,
    openFolder:PropTypes.func,
    id:PropTypes.number,
    saveDraggingId:PropTypes.func,
    dropElement:PropTypes.func,
    draggingId:PropTypes.number,
};

export default LinkMobile;