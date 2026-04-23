function ModelCard({name, url, icon, colour, isEditMode = false, onEdit}) {

    const getAnimation = () =>
    {
        var randomDelay = Math.floor(Math.random() * (75 - 2 + 1)) + 2;
        var randomDuration = Math.floor(Math.random() * (30 - 3 + 1)) + 3;
        return `animation-delay: -0.${randomDelay}s; animation-duration: .${randomDuration}s;`;
    }

    const getAnimationStyle = () =>
    {
        var randomDelay = Math.floor(Math.random() * (75 - 2 + 1)) + 2;
        var randomDuration = Math.floor(Math.random() * (30 - 3 + 1)) + 3;
        if (isEditMode) {
            return {
                color: colour,
                animationDelay: `-0.${randomDelay}s`,
                animationDuration: `.${randomDuration}s`
            }
        }
        
        return {
            color: colour
        }
    }
    
    const handleClick = (e) => {
        if (isEditMode) {
            e.preventDefault();
            if (onEdit) {
                onEdit({
                    Name: name,
                    Href: url,
                    Icon: icon,
                    Theme: colour
                });
            }
        }
    };
    
    return (
        <div className="">
            <a className="bookmark d-flex flex-column" 
               href={url} 
               onClick={handleClick}>
              <span className={`bookmark-icon ${icon} fa-3x align-self-center`}
                    style={getAnimationStyle()}></span>
                <span className="bookmark-text">{name}</span>
            </a>
        </div>
    );
}

export default ModelCard;
