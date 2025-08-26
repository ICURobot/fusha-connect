import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export default function LessonNavigation({ previousLesson, nextLesson }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        {previousLesson ? (
          <Link to={createPageUrl(`Lesson?id=${previousLesson.id}`)}>
            <Button className="clay-button flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <div className="text-left">
                <div className="text-sm text-gray-600">Previous</div>
                <div className="font-medium">{previousLesson.title}</div>
              </div>
            </Button>
          </Link>
        ) : (
          <div></div>
        )}
      </div>

      <div>
        {nextLesson ? (
          <Link to={createPageUrl(`Lesson?id=${nextLesson.id}`)}>
            <Button className="clay-button flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm text-gray-600">Next</div>
                <div className="font-medium">{nextLesson.title}</div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
