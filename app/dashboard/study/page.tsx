"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, Database, Network, BookOpen, Brain, Zap, Focus } from "lucide-react"
import { StudySession } from "@/components/study/study-session"

type Topic = "data-structures" | "algorithms" | "system-design" | "oop" | "databases" | "networks"
type Difficulty = "easy" | "medium" | "hard"

export default function StudyPracticePage() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [sessionActive, setSessionActive] = useState(false)

  const handleStartSession = (topic: Topic) => {
    setSelectedTopic(topic)
    setSessionActive(true)
  }

  const handleEndSession = () => {
    setSessionActive(false)
    setSelectedTopic(null)
  }

  if (sessionActive && selectedTopic) {
    return <StudySession topic={selectedTopic} difficulty={difficulty} onEnd={handleEndSession} />
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Study Practice</h1>
        <p className="text-lg text-muted-foreground">
          Master computer science concepts with AI-generated practice questions
        </p>
      </div>

      {/* Difficulty Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Difficulty Level</CardTitle>
          <CardDescription>Choose a difficulty that matches your current skill level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={difficulty === "easy" ? "default" : "outline"}
              onClick={() => setDifficulty("easy")}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Easy
            </Button>
            <Button
              variant={difficulty === "medium" ? "default" : "outline"}
              onClick={() => setDifficulty("medium")}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              Medium
            </Button>
            <Button
              variant={difficulty === "hard" ? "default" : "outline"}
              onClick={() => setDifficulty("hard")}
              className="flex-1"
            >
              <Focus className="h-4 w-4 mr-2" />
              Hard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topic Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleStartSession("data-structures")}
        >
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Data Structures</CardTitle>
            <CardDescription>Arrays, Trees, Graphs, Hash Tables, and more</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Arrays</Badge>
              <Badge variant="secondary">Linked Lists</Badge>
              <Badge variant="secondary">Trees</Badge>
              <Badge variant="secondary">Graphs</Badge>
            </div>
            <Button className="w-full">Start Practice</Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleStartSession("algorithms")}
        >
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-2">
              <Code className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle>Algorithms</CardTitle>
            <CardDescription>Sorting, Searching, Dynamic Programming, Greedy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Sorting</Badge>
              <Badge variant="secondary">Searching</Badge>
              <Badge variant="secondary">DP</Badge>
              <Badge variant="secondary">Greedy</Badge>
            </div>
            <Button className="w-full">Start Practice</Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleStartSession("system-design")}
        >
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
              <Network className="h-6 w-6 text-accent" />
            </div>
            <CardTitle>System Design</CardTitle>
            <CardDescription>Scalability, Architecture, Distributed Systems</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Scalability</Badge>
              <Badge variant="secondary">Caching</Badge>
              <Badge variant="secondary">Load Balancing</Badge>
            </div>
            <Button className="w-full">Start Practice</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStartSession("oop")}>
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>OOP Concepts</CardTitle>
            <CardDescription>Classes, Inheritance, Polymorphism, Design Patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Inheritance</Badge>
              <Badge variant="secondary">Encapsulation</Badge>
              <Badge variant="secondary">Patterns</Badge>
            </div>
            <Button className="w-full">Start Practice</Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleStartSession("databases")}
        >
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-2">
              <Database className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle>Databases</CardTitle>
            <CardDescription>SQL, NoSQL, Indexing, Transactions, Normalization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">SQL</Badge>
              <Badge variant="secondary">NoSQL</Badge>
              <Badge variant="secondary">Indexing</Badge>
            </div>
            <Button className="w-full">Start Practice</Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleStartSession("networks")}
        >
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
              <Network className="h-6 w-6 text-accent" />
            </div>
            <CardTitle>Networks</CardTitle>
            <CardDescription>TCP/IP, HTTP, DNS, Security, Protocols</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">TCP/IP</Badge>
              <Badge variant="secondary">HTTP</Badge>
              <Badge variant="secondary">Security</Badge>
            </div>
            <Button className="w-full">Start Practice</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
