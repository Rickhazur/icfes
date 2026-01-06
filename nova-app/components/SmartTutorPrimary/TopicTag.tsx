import React from 'react';

interface TopicTagProps {
    topic: string;
}

const TopicTag = ({ topic }: TopicTagProps) => {
    return (
        <span className="px-3 py-1.5 bg-card/80 rounded-full text-sm font-medium text-foreground/80 border border-border/50">
            {topic}
        </span>
    );
};

export default TopicTag;
